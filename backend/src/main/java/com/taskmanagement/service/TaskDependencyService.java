package com.taskmanagement.service;

import com.taskmanagement.dto.TaskDependencyDto;
import com.taskmanagement.exception.ResourceNotFoundException;
import com.taskmanagement.exception.ValidationException;
import com.taskmanagement.model.Task;
import com.taskmanagement.model.TaskDependency;
import com.taskmanagement.repository.TaskDependencyRepository;
import com.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskDependencyService {

    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskRepository taskRepository;

    public List<TaskDependencyDto> getDependenciesByTaskId(Long taskId) {
        return taskDependencyRepository.findByTaskId(taskId).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Transactional
    public TaskDependencyDto createDependency(TaskDependencyDto dependencyDto) {
        log.info("Creating dependency: task {} depends on task {}",
                 dependencyDto.getTaskId(), dependencyDto.getPredecessorTaskId());

        // Validate both tasks exist
        Task task = taskRepository.findById(dependencyDto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + dependencyDto.getTaskId()));

        Task predecessorTask = taskRepository.findById(dependencyDto.getPredecessorTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Predecessor task not found with id: " + dependencyDto.getPredecessorTaskId()));

        // Validate tasks are in the same project
        if (!task.getProject().getId().equals(predecessorTask.getProject().getId())) {
            throw new ValidationException("Tasks must be in the same project");
        }

        // Validate self-dependency
        if (dependencyDto.getTaskId().equals(dependencyDto.getPredecessorTaskId())) {
            throw new ValidationException("Task cannot depend on itself");
        }

        // Check if dependency already exists
        if (taskDependencyRepository.existsByTaskIdAndPredecessorTaskId(
                dependencyDto.getTaskId(), dependencyDto.getPredecessorTaskId())) {
            throw new ValidationException("Dependency already exists");
        }

        // Check for circular dependencies
        if (wouldCreateCircularDependency(dependencyDto.getTaskId(), dependencyDto.getPredecessorTaskId())) {
            throw new ValidationException("Cannot create dependency: would create circular dependency");
        }

        TaskDependency dependency = new TaskDependency();
        dependency.setTask(task);
        dependency.setPredecessorTask(predecessorTask);
        dependency.setType(dependencyDto.getType() != null ? dependencyDto.getType() : "FS");

        TaskDependency savedDependency = taskDependencyRepository.save(dependency);
        log.info("Dependency created with id: {}", savedDependency.getId());

        return convertToDto(savedDependency);
    }

    @Transactional
    public void deleteDependency(Long id) {
        log.info("Deleting dependency with id: {}", id);

        if (!taskDependencyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dependency not found with id: " + id);
        }

        taskDependencyRepository.deleteById(id);
        log.info("Dependency deleted with id: {}", id);
    }

    /**
     * Check if adding a dependency would create a circular dependency
     * Uses depth-first search to detect cycles
     */
    private boolean wouldCreateCircularDependency(Long taskId, Long predecessorTaskId) {
        Set<Long> visited = new HashSet<>();
        return hasPathTo(predecessorTaskId, taskId, visited);
    }

    private boolean hasPathTo(Long fromTaskId, Long toTaskId, Set<Long> visited) {
        if (fromTaskId.equals(toTaskId)) {
            return true;
        }

        if (visited.contains(fromTaskId)) {
            return false;
        }

        visited.add(fromTaskId);

        // Get all dependencies where fromTaskId depends on other tasks
        List<TaskDependency> dependencies = taskDependencyRepository.findByTaskId(fromTaskId);

        for (TaskDependency dependency : dependencies) {
            if (hasPathTo(dependency.getPredecessorTask().getId(), toTaskId, visited)) {
                return true;
            }
        }

        return false;
    }

    private TaskDependencyDto convertToDto(TaskDependency dependency) {
        TaskDependencyDto dto = new TaskDependencyDto();
        dto.setId(dependency.getId());
        dto.setTaskId(dependency.getTask().getId());
        dto.setPredecessorTaskId(dependency.getPredecessorTask().getId());
        dto.setType(dependency.getType());
        dto.setCreatedAt(dependency.getCreatedAt());
        return dto;
    }
}
