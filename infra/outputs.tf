output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = aws_s3_bucket.frontend.bucket
}

### TaskVision ACM Outputs (START)

output "frontend_certificate_arn" {
  value = module.acm.certificate_arn
}

### TaskVision ACM Outputs (END)
