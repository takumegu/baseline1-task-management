package com.taskmanagement.controller;

import com.taskmanagement.dto.ApiResponse;
import com.taskmanagement.dto.TaskDependencyDto;
import com.taskmanagement.service.TaskDependencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskDependencyController {

    private final TaskDependencyService taskDependencyService;

    @GetMapping("/{taskId}/dependencies")
    public ResponseEntity<ApiResponse<List<TaskDependencyDto>>> getDependencies(@PathVariable Long taskId) {
        log.info("GET /api/tasks/{}/dependencies", taskId);

        List<TaskDependencyDto> dependencies = taskDependencyService.getDependenciesByTaskId(taskId);
        ApiResponse<List<TaskDependencyDto>> response = new ApiResponse<>(dependencies);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{taskId}/dependencies")
    public ResponseEntity<ApiResponse<TaskDependencyDto>> createDependency(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDependencyDto dependencyDto
    ) {
        log.info("POST /api/tasks/{}/dependencies", taskId);

        dependencyDto.setTaskId(taskId);
        TaskDependencyDto createdDependency = taskDependencyService.createDependency(dependencyDto);
        ApiResponse<TaskDependencyDto> response = new ApiResponse<>(createdDependency);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{taskId}/dependencies/{dependencyId}")
    public ResponseEntity<ApiResponse<Void>> deleteDependency(
            @PathVariable Long taskId,
            @PathVariable Long dependencyId
    ) {
        log.info("DELETE /api/tasks/{}/dependencies/{}", taskId, dependencyId);

        taskDependencyService.deleteDependency(dependencyId);
        ApiResponse<Void> response = new ApiResponse<>(null);
        return ResponseEntity.ok(response);
    }
}
