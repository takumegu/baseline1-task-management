package com.taskmanagement.repository;

import com.taskmanagement.model.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskDependencyRepository extends JpaRepository<TaskDependency, Long> {

    List<TaskDependency> findByTaskId(Long taskId);

    List<TaskDependency> findByPredecessorTaskId(Long predecessorTaskId);

    @Query("SELECT td FROM TaskDependency td WHERE td.task.id = :taskId AND td.predecessorTask.id = :predecessorTaskId")
    Optional<TaskDependency> findByTaskIdAndPredecessorTaskId(
        @Param("taskId") Long taskId,
        @Param("predecessorTaskId") Long predecessorTaskId
    );

    boolean existsByTaskIdAndPredecessorTaskId(Long taskId, Long predecessorTaskId);

    void deleteByTaskId(Long taskId);
}
