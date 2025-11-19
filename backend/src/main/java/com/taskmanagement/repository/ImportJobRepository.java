package com.taskmanagement.repository;

import com.taskmanagement.model.ImportJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportJobRepository extends JpaRepository<ImportJob, Long> {

    List<ImportJob> findByStatus(String status);

    @Query("SELECT ij FROM ImportJob ij ORDER BY ij.executedAt DESC")
    List<ImportJob> findAllOrderByExecutedAtDesc();

    @Query("SELECT ij FROM ImportJob ij WHERE ij.status = :status ORDER BY ij.executedAt DESC")
    List<ImportJob> findByStatusOrderByExecutedAtDesc(String status);
}
