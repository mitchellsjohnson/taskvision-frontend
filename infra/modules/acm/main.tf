### TaskVision ACM Module (START)

# ACM Certificate
data "aws_acm_certificate" "existing" {
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true

  lifecycle {
    postcondition {
      condition     = self.arn != ""
      error_message = "No valid ACM certificate found for domain ${var.domain_name}"
    }
  }
}

locals {
  certificate_arn = data.aws_acm_certificate.existing.arn
}

### TaskVision ACM Module (END)
