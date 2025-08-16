---
title: Pistachio
date: 08-16-2025
summary: Lightweight Raspberry Pi setup for RSS/DNS service.
---

## Pre Outline

* Past setup
    * FreshRSS - too heavy for me
    * Pihole – great, talk about why
    * Last homelab setup was an old Xeon my dad gave me, idled at 45W, very loud

**Goals:** Reduce load on server and noise

* DietPi
    * My setup
* Pihole
    * Dietpi install
* Miniflux
    * Postgres DietPi
    * Postgres config
    * Not using TCP/IP and using socket instead
* Reverse proxy
    * Nginx dietpi
    * nginx config
* Tailscale
    * Serve
    * Trusting certs (tailscale cert)