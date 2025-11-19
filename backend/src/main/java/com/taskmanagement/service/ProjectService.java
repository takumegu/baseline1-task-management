package com.taskmanagement.service;

import com.taskmanagement.dto.ProjectDto;
import com.taskmanagement.exception.ResourceNotFoundException;
import com.taskmanagement.model.Project;
import com.taskmanagement.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDto> getActiveProjects() {
        return projectRepository.findActiveProjects().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return convertToDto(project);
    }

    @Transactional
    public ProjectDto createProject(ProjectDto projectDto) {
        log.info("Creating new project: {}", projectDto.getName());

        Project project = new Project();
        project.setName(projectDto.getName());
        project.setStartDate(projectDto.getStartDate());
        project.setEndDate(projectDto.getEndDate());
        project.setStatus(projectDto.getStatus() != null ? projectDto.getStatus() : "active");

        Project savedProject = projectRepository.save(project);
        log.info("Project created with id: {}", savedProject.getId());

        return convertToDto(savedProject);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        log.info("Updating project with id: {}", id);

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        if (projectDto.getName() != null) {
            project.setName(projectDto.getName());
        }
        if (projectDto.getStartDate() != null) {
            project.setStartDate(projectDto.getStartDate());
        }
        if (projectDto.getEndDate() != null) {
            project.setEndDate(projectDto.getEndDate());
        }
        if (projectDto.getStatus() != null) {
            project.setStatus(projectDto.getStatus());
        }

        Project updatedProject = projectRepository.save(project);
        log.info("Project updated with id: {}", updatedProject.getId());

        return convertToDto(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        log.info("Deleting project with id: {}", id);

        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }

        projectRepository.deleteById(id);
        log.info("Project deleted with id: {}", id);
    }

    private ProjectDto convertToDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
}
