package com.sentinel.tenancy.repository;

import com.sentinel.tenancy.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findByWardId(UUID wardId);
    Optional<Room> findByRoomNumber(String roomNumber);
    Optional<Room> findByWardIdAndRoomNumber(UUID wardId, String roomNumber);
    boolean existsByWardIdAndRoomNumber(UUID wardId, String roomNumber);
}
