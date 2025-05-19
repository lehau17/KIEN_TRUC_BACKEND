package bookingservice.service;

import bookingservice.dto.RoomDTO;
import bookingservice.dto.RoomServiceResponseDTO;
import bookingservice.dto.StatusUpdateDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
public class RoomServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(RoomServiceClient.class);

    private final WebClient webClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public RoomServiceClient(WebClient.Builder webClientBuilder,
                             @Value("${room-service.url:http://localhost:5001/api/room}") String roomServiceUrl,
                             RedisTemplate<String, Object> redisTemplate,
                             ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.baseUrl(roomServiceUrl).build();
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @CircuitBreaker(name = "roomService", fallbackMethod = "roomServiceFallback")
    public Flux<RoomDTO> getAvailableRooms() {
        String cacheKey = "rooms:available";
        Object cachedData = redisTemplate.opsForValue().get(cacheKey);
        List<RoomDTO> cachedRooms = null;
        if (cachedData != null) {
            try {
                cachedRooms = objectMapper.convertValue(cachedData,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, RoomDTO.class));
                logger.debug("Returning cached available rooms");
                return Flux.fromIterable(cachedRooms);
            } catch (Exception e) {
                logger.error("Error converting cached data to List<RoomDTO> in getAvailableRooms: {}", e.getMessage());
            }
        }

        return webClient.get()
                .uri("/status/available")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnNext(response -> logger.info("Raw response from RoomService for available rooms: {}", response))
                .flatMapMany(response -> {
                    Boolean isSuccess = (Boolean) response.get("isSuccess");
                    Object data = response.get("data");
                    if (!isSuccess || data == null) {
                        logger.warn("RoomService returned unsuccessful response or null data");
                        return Flux.empty();
                    }
                    try {
                        logger.info("Data before conversion in getAvailableRooms: {}", data);
                        List<Map<String, Object>> rawRooms = (List<Map<String, Object>>) data;
                        List<RoomDTO> rooms = objectMapper.convertValue(rawRooms,
                                objectMapper.getTypeFactory().constructCollectionType(List.class, RoomDTO.class));
                        return Flux.fromIterable(rooms);
                    } catch (Exception e) {
                        logger.error("Error parsing RoomService response for available rooms: {}", e.getMessage());
                        return Flux.error(new IllegalArgumentException("Lỗi ánh xạ dữ liệu phòng: " + e.getMessage()));
                    }
                })
                .collectList()
                .doOnNext(rooms -> {
                    logger.info("Cached {} available rooms", rooms.size());
                    redisTemplate.opsForValue().set(cacheKey, rooms, 10, TimeUnit.MINUTES);
                })
                .flatMapMany(Flux::fromIterable);
    }

    @CircuitBreaker(name = "roomService", fallbackMethod = "roomServiceFallback")
    public Mono<RoomDTO> getRoomById(String roomId) {
        String cacheKey = "room:" + roomId;
        Object cachedData = redisTemplate.opsForValue().get(cacheKey);
        RoomDTO cachedRoom = null;
        if (cachedData != null) {
            try {
                cachedRoom = objectMapper.convertValue(cachedData, RoomDTO.class);
                logger.debug("Returning cached room {}", roomId);
                return Mono.just(cachedRoom);
            } catch (Exception e) {
                logger.error("Error converting cached data to RoomDTO for roomId {}: {}", roomId, e.getMessage());
            }
        }

        return webClient.get()
                .uri("/{roomId}", roomId)
                .retrieve()
                .onStatus(httpStatus -> httpStatus.is4xxClientError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .flatMap(body -> {
                                    logger.warn("RoomService error for roomId {}: {}", roomId, body);
                                    if (body.contains("INVALID_OBJECT_ID")) {
                                        return Mono.error(new IllegalArgumentException("ID phòng không hợp lệ: " + roomId));
                                    }
                                    return Mono.error(new IllegalArgumentException("Lỗi từ RoomService: " + body));
                                }))
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnNext(response -> logger.info("Raw response from RoomService for roomId {}: {}", roomId, response))
                .flatMap(response -> {
                    Boolean isSuccess = (Boolean) response.get("isSuccess");
                    Object data = response.get("data");
                    if (!isSuccess || data == null) {
                        logger.warn("RoomService returned unsuccessful response or null data for roomId {}", roomId);
                        return Mono.error(new IllegalArgumentException("Phòng không tồn tại: " + roomId));
                    }
                    try {
                        logger.info("Data before conversion in getRoomById: {}", data);
                        RoomDTO room = objectMapper.convertValue(data, RoomDTO.class);
                        return Mono.just(room);
                    } catch (Exception e) {
                        logger.error("Error parsing RoomService response for roomId {}: {}", roomId, e.getMessage());
                        return Mono.error(new IllegalArgumentException("Lỗi ánh xạ dữ liệu phòng: " + e.getMessage()));
                    }
                })
                .doOnNext(room -> {
                    logger.info("Cached room {}", roomId);
                    redisTemplate.opsForValue().set(cacheKey, room, 10, TimeUnit.MINUTES);
                });
    }

    @CircuitBreaker(name = "roomService", fallbackMethod = "roomServiceFallback")
    public Flux<RoomDTO> getRoomsByStatus(String status) {
        String cacheKey = "rooms:status:" + status;
        Object cachedData = redisTemplate.opsForValue().get(cacheKey);
        List<RoomDTO> cachedRooms = null;
        if (cachedData != null) {
            try {
                cachedRooms = objectMapper.convertValue(cachedData,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, RoomDTO.class));
                logger.debug("Returning cached rooms with status {}", status);
                return Flux.fromIterable(cachedRooms);
            } catch (Exception e) {
                logger.error("Error converting cached data to List<RoomDTO> for status {}: {}", status, e.getMessage());
            }
        }

        return webClient.get()
                .uri("/status/{status}", status)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .doOnNext(response -> logger.info("Raw response from RoomService for status {}: {}", status, response))
                .flatMapMany(response -> {
                    Boolean isSuccess = (Boolean) response.get("isSuccess");
                    Object data = response.get("data");
                    if (!isSuccess || data == null) {
                        logger.warn("RoomService returned unsuccessful response or null data for status {}", status);
                        return Flux.empty();
                    }
                    try {
                        logger.info("Data before conversion in getRoomsByStatus: {}", data);
                        List<Map<String, Object>> rawRooms = (List<Map<String, Object>>) data;
                        List<RoomDTO> rooms = objectMapper.convertValue(rawRooms,
                                objectMapper.getTypeFactory().constructCollectionType(List.class, RoomDTO.class));
                        return Flux.fromIterable(rooms);
                    } catch (Exception e) {
                        logger.error("Error parsing RoomService response for status {}: {}", status, e.getMessage());
                        return Flux.error(new IllegalArgumentException("Lỗi ánh xạ dữ liệu phòng: " + e.getMessage()));
                    }
                })
                .collectList()
                .doOnNext(rooms -> {
                    logger.info("Cached {} rooms with status {}", rooms.size(), status);
                    redisTemplate.opsForValue().set(cacheKey, rooms, 10, TimeUnit.MINUTES);
                })
                .flatMapMany(Flux::fromIterable);
    }

    @CircuitBreaker(name = "roomService", fallbackMethod = "roomServiceFallback")
    public Mono<Void> updateRoomStatus(String roomId, String status) {
        logger.info("Attempting to update room {} status to {}", roomId, status);
        return webClient.put()
                .uri("/{roomId}/status", roomId)
                .bodyValue(new StatusUpdateDTO(status))
                .retrieve()
                .onStatus(httpStatus -> httpStatus.is4xxClientError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .doOnNext(body -> logger.warn("RoomService error updating status for roomId {}: {}", roomId, body))
                                .flatMap(body -> {
                                    if (body.contains("INVALID_OBJECT_ID")) {
                                        return Mono.error(new RuntimeException("ID phòng không hợp lệ: " + roomId));
                                    }
                                    return Mono.error(new RuntimeException("Lỗi từ RoomService khi cập nhật trạng thái phòng: " + body));
                                }))
                .onStatus(httpStatus -> httpStatus.is5xxServerError(), clientResponse ->
                        clientResponse.bodyToMono(String.class)
                                .doOnNext(body -> logger.error("RoomService server error updating status for roomId {}: {}", roomId, body))
                                .flatMap(body -> Mono.error(new RuntimeException("Lỗi máy chủ từ RoomService: " + body))))
                .bodyToMono(Void.class)
                .doOnSuccess(v -> {
                    logger.info("Successfully updated room {} status to {}", roomId, status);
                    redisTemplate.delete("room:" + roomId);
                    redisTemplate.delete("rooms:available");
                    redisTemplate.delete("rooms:status:available");
                    redisTemplate.delete("rooms:status:booked");
                })
                .doOnError(error -> logger.error("Failed to update room status for roomId {}: {}", roomId, error.getMessage()));
    }

    public Mono<RoomDTO> roomServiceFallback(String roomId, Throwable t) {
        logger.error("RoomService fallback for roomId {}: {}", roomId, t.getMessage());
        return Mono.error(new RuntimeException("RoomService không phản hồi: " + t.getMessage()));
    }

    public Flux<RoomDTO> roomServiceFallback(Throwable t) {
        logger.error("RoomService fallback: {}", t.getMessage());
        return Flux.error(new RuntimeException("RoomService không phản hồi: " + t.getMessage()));
    }

    public Mono<Void> roomServiceFallback(String roomId, String status, Throwable t) {
        logger.error("RoomService fallback for roomId {} status {}: {}", roomId, status, t.getMessage());
        return Mono.error(new RuntimeException("RoomService không phản hồi: " + t.getMessage()));
    }
}