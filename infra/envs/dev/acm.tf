module "acm_dev" {
  source      = "../../modules/acm"
  domain_name = "dev.taskvision.ai"
  san_list    = []
  zone_id     = var.zone_id
  environment = "dev"
}

output "certificate_arn_dev" {
  value = module.acm_dev.certificate_arn
}