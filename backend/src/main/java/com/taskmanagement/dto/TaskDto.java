package com.taskmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;

    @NotNull(message = "Project ID is required")
    private Long projectId;

    @Size(max = 64, message = "Task code must not exceed 64 characters")
    private String taskCode;

    @NotBlank(message = "Task name is required")
    @Size(max = 255, message = "Task name must not exceed 255 characters")
    private String name;

    @Size(max = 120, message = "Assignee must not exceed 120 characters")
    private String assignee;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Min(value = 0, message = "Progress must be at least 0")
    @Max(value = 100, message = "Progress must not exceed 100")
    private Integer progress;

    @NotBlank(message = "Status is required")
    private String status;

    private Long parentTaskId;
    private Boolean isMilestone;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
