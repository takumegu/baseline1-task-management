package com.taskmanagement.service;

import com.taskmanagement.dto.TaskDto;
import com.taskmanagement.exception.ResourceNotFoundException;
import com.taskmanagement.exception.ValidationException;
import com.taskmanagement.model.Project;
import com.taskmanagement.model.Task;
import com.taskmanagement.repository.ProjectRepository;
import com.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<TaskDto> getTasksByProjectIdAndDateRange(Long projectId, LocalDate startDate, LocalDate endDate) {
        return taskRepository.findByProjectIdAndDateRange(projectId, startDate, endDate).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return convertToDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskDto taskDto) {
        log.info("Creating new task: {}", taskDto.getName());

        // Validate project exists
        Project project = projectRepository.findById(taskDto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + taskDto.getProjectId()));

        // Validate task code uniqueness within project
        if (taskDto.getTaskCode() != null && taskRepository.existsByProjectIdAndTaskCode(taskDto.getProjectId(), taskDto.getTaskCode())) {
            throw new ValidationException("Task code already exists in project: " + taskDto.getTaskCode());
        }

        // Validate dates
        if (taskDto.getStartDate().isAfter(taskDto.getEndDate())) {
            throw new ValidationException("Start date must be before or equal to end date");
        }

        Task task = new Task();
        task.setProject(project);
        task.setTaskCode(taskDto.getTaskCode());
        task.setName(taskDto.getName());
        task.setAssignee(taskDto.getAssignee());
        task.setStartDate(taskDto.getStartDate());
        task.setEndDate(taskDto.getEndDate());
        task.setProgress(taskDto.getProgress() != null ? taskDto.getProgress() : 0);
        task.setStatus(taskDto.getStatus() != null ? taskDto.getStatus() : "planned");
        task.setIsMilestone(taskDto.getIsMilestone() != null ? taskDto.getIsMilestone() : false);
        task.setNotes(taskDto.getNotes());

        // Handle parent task
        if (taskDto.getParentTaskId() != null) {
            Task parentTask = taskRepository.findById(taskDto.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task not found with id: " + taskDto.getParentTaskId()));
            task.setParentTask(parentTask);
        }

        Task savedTask = taskRepository.save(task);
        log.info("Task created with id: {}", savedTask.getId());

        return convertToDto(savedTask);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskDto taskDto) {
        log.info("Updating task with id: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (taskDto.getName() != null) {
            task.setName(taskDto.getName());
        }
        if (taskDto.getAssignee() != null) {
            task.setAssignee(taskDto.getAssignee());
        }
        if (taskDto.getStartDate() != null) {
            task.setStartDate(taskDto.getStartDate());
        }
        if (taskDto.getEndDate() != null) {
            task.setEndDate(taskDto.getEndDate());
        }
        if (taskDto.getProgress() != null) {
            task.setProgress(taskDto.getProgress());
        }
        if (taskDto.getStatus() != null) {
            task.setStatus(taskDto.getStatus());
        }
        if (taskDto.getIsMilestone() != null) {
            task.setIsMilestone(taskDto.getIsMilestone());
        }
        if (taskDto.getNotes() != null) {
            task.setNotes(taskDto.getNotes());
        }

        // Handle parent task update
        if (taskDto.getParentTaskId() != null) {
            Task parentTask = taskRepository.findById(taskDto.getParentTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent task not found with id: " + taskDto.getParentTaskId()));
            task.setParentTask(parentTask);
        }

        // Validate dates after update
        if (task.getStartDate().isAfter(task.getEndDate())) {
            throw new ValidationException("Start date must be before or equal to end date");
        }

        Task updatedTask = taskRepository.save(task);
        log.info("Task updated with id: {}", updatedTask.getId());

        return convertToDto(updatedTask);
    }

    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting task with id: {}", id);

        if (!taskRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }

        taskRepository.deleteById(id);
        log.info("Task deleted with id: {}", id);
    }

    private TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setProjectId(task.getProject().getId());
        dto.setTaskCode(task.getTaskCode());
        dto.setName(task.getName());
        dto.setAssignee(task.getAssignee());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setProgress(task.getProgress());
        dto.setStatus(task.getStatus());
        dto.setParentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null);
        dto.setIsMilestone(task.getIsMilestone());
        dto.setNotes(task.getNotes());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
