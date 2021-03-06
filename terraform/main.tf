// env vars required in CIRCLECI:
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY
// HEROKU_API_KEY
// HEROKU_EMAIL
// REACT_APP_BACKEND_BASE_URL
// REACT_APP_FRONTEND_BASE_URL
// TF_VAR_aws_region
// TF_VAR_backend_domain
// TF_VAR_cert_domain
// TF_VAR_environment
// TF_VAR_frontend_domain
// TF_VAR_root_domain


variable "aws_region" {
  default = "eu-west-1"
}

variable "root_domain" {
  default = "freedman.io"
}
variable "cert_domain" {
  default = "backend.tembo.freedman.io"
}
variable "backend_domain" {
  default = "backend.tembo.freedman.io"
}

terraform {
  backend "s3" {
    bucket         = "freedmanio-terraform"
    key            = "tembo.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "heroku" {}

provider "aws" {
  region = var.aws_region
}

resource "heroku_app" "backend" {
  name   = "tembo-backend-${terraform.workspace}"
  region = "eu"
  // acm    = "true"

  //  config_vars = {
  //    FOOBAR = "baz"
  //

  buildpacks = [
    "heroku/python"
  ]
}

resource "heroku_addon" "database" {
  app  = heroku_app.backend.name
  plan = "heroku-postgresql:hobby-dev"
}

resource "heroku_addon" "sentry" {
  app  = heroku_app.backend.name
  plan = "sentry:f1"
}


// Can't use Terraform for this because we want to share the same add-on across all environments
//resource "heroku_addon" "logging" {
//  app  = heroku_app.backend.name
//  plan = "papertrail:choklad"
//}

resource "heroku_domain" "backend" {
  app      = heroku_app.backend.name
  hostname = var.backend_domain
}


// For CloudFront, the SSL certificate must be in us-east-1
provider "aws" {
  alias = "acm"
  region = "us-east-1"
}
//data "aws_acm_certificate" "ssl_cert" {
//  provider = aws.acm
//  domain   = var.cert_domain
//  statuses = ["ISSUED"]
//}
//
//resource "aws_cloudfront_distribution" "backend_cloudfront_distribution" {
//  origin {
//    custom_origin_config {
//      http_port              = "80"
//      https_port             = "443"
//      origin_protocol_policy = "http-only"
//      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
//    }
//    domain_name = heroku_domain.backend.cname
//    origin_id   = heroku_domain.backend.cname
//  }
//
//  enabled             = true
//  default_root_object = "index.html"
//
//  default_cache_behavior {
//    viewer_protocol_policy = "redirect-to-https"
//    compress               = true
//    allowed_methods        = ["GET", "HEAD"]
//    cached_methods         = ["GET", "HEAD"]
//    target_origin_id       = heroku_domain.backend.cname
//    min_ttl                = 0
//    default_ttl            = 86400
//    max_ttl                = 31536000
//
//    forwarded_values {
//      query_string = false
//      cookies {
//        forward = "none"
//      }
//    }
//  }
//
//  custom_error_response {
//    error_caching_min_ttl = 3000
//    error_code            = 404
//    response_code         = 200
//    response_page_path    = "/index.html"
//  }
//
//  aliases = [var.backend_domain]
//
//  restrictions {
//    geo_restriction {
//      restriction_type = "none"
//    }
//  }
//
//  viewer_certificate {
//    acm_certificate_arn = data.aws_acm_certificate.ssl_cert.arn
//    ssl_support_method  = "sni-only"
//  }
//}

//data "aws_route53_zone" "zone" {
//  name         = var.root_domain
//  private_zone = false
//}
//
//resource "aws_route53_record" "backend_record" {
//  zone_id = data.aws_route53_zone.zone.zone_id
//  name    = var.backend_domain
//  type    = "CNAME"
//  records = [heroku_domain.backend.cname]
//  ttl     = 60
//
//  //  alias {
//  //    name = aws_cloudfront_distribution.backend_cloudfront_distribution.domain_name
//  //    zone_id = aws_cloudfront_distribution.backend_cloudfront_distribution.hosted_zone_id
//  //    evaluate_target_health = false
//  //  }
//}
