package com.taskmanagement.repository;

import com.taskmanagement.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatus(String status);

    Optional<Project> findByName(String name);

    @Query("SELECT p FROM Project p WHERE p.status = 'active' ORDER BY p.createdAt DESC")
    List<Project> findActiveProjects();

    boolean existsByName(String name);
}
