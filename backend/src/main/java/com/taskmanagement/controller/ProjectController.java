package com.taskmanagement.controller;

import com.taskmanagement.dto.ApiResponse;
import com.taskmanagement.dto.ProjectDto;
import com.taskmanagement.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("GET /api/projects - activeOnly: {}", activeOnly);

        List<ProjectDto> projects = activeOnly
                ? projectService.getActiveProjects()
                : projectService.getAllProjects();

        ApiResponse<List<ProjectDto>> response = new ApiResponse<>(projects);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        log.info("GET /api/projects/{}", id);

        ProjectDto project = projectService.getProjectById(id);
        ApiResponse<ProjectDto> response = new ApiResponse<>(project);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody ProjectDto projectDto) {
        log.info("POST /api/projects - name: {}", projectDto.getName());

        ProjectDto createdProject = projectService.createProject(projectDto);
        ApiResponse<ProjectDto> response = new ApiResponse<>(createdProject);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDto projectDto
    ) {
        log.info("PATCH /api/projects/{}", id);

        ProjectDto updatedProject = projectService.updateProject(id, projectDto);
        ApiResponse<ProjectDto> response = new ApiResponse<>(updatedProject);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        log.info("DELETE /api/projects/{}", id);

        projectService.deleteProject(id);
        ApiResponse<Void> response = new ApiResponse<>(null);
        return ResponseEntity.ok(response);
    }
}
