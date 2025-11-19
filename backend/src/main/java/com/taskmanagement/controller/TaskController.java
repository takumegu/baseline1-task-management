package com.taskmanagement.controller;

import com.taskmanagement.dto.ApiResponse;
import com.taskmanagement.dto.TaskDto;
import com.taskmanagement.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<List<TaskDto>>> getTasksByProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        log.info("GET /api/projects/{}/tasks - from: {}, to: {}", projectId, from, to);

        List<TaskDto> tasks;
        if (from != null && to != null) {
            tasks = taskService.getTasksByProjectIdAndDateRange(projectId, from, to);
        } else {
            tasks = taskService.getTasksByProjectId(projectId);
        }

        ApiResponse<List<TaskDto>> response = new ApiResponse<>(tasks);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> getTaskById(@PathVariable Long id) {
        log.info("GET /api/tasks/{}", id);

        TaskDto task = taskService.getTaskById(id);
        ApiResponse<TaskDto> response = new ApiResponse<>(task);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects/{projectId}/tasks")
    public ResponseEntity<ApiResponse<TaskDto>> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskDto taskDto
    ) {
        log.info("POST /api/projects/{}/tasks - name: {}", projectId, taskDto.getName());

        taskDto.setProjectId(projectId);
        TaskDto createdTask = taskService.createTask(taskDto);
        ApiResponse<TaskDto> response = new ApiResponse<>(createdTask);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskDto>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto taskDto
    ) {
        log.info("PATCH /api/tasks/{}", id);

        TaskDto updatedTask = taskService.updateTask(id, taskDto);
        ApiResponse<TaskDto> response = new ApiResponse<>(updatedTask);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        log.info("DELETE /api/tasks/{}", id);

        taskService.deleteTask(id);
        ApiResponse<Void> response = new ApiResponse<>(null);
        return ResponseEntity.ok(response);
    }
}
