# Deploy Nagios easily with Docker

![Cover image for Deploy Nagios easily with Docker](../../assets/blog/dockerxnagios.png)

Monitoring is a core part of any IT infrastructure.
It helps track server, service, and network availability so incidents can be detected quickly.

In this article, we deploy **Nagios quickly with Docker**, without a complex host installation.

## What is Nagios?

Nagios is a widely used open-source monitoring platform.

It can monitor:

- Linux and Windows servers
- network services (HTTP, SSH, DNS, SMTP...)
- network devices
- system availability and performance

It can also send **automatic alerts** when a service fails.

## Why use Docker?

Docker runs applications inside isolated containers.

Benefits include:

- very fast installation
- isolated environment
- portability across machines
- reproducible deployment

## Docker image used

We use the maintained image by Jason Rivers:

`https://hub.docker.com/r/jasonrivers/nagios`

## Deploy the Nagios container

```bash
docker pull jasonrivers/nagios
docker run -d --name nagios -p 8081:80 jasonrivers/nagios
```

## Access the web interface

Open:

`http://localhost:8081/nagios`

Default credentials:

`User: nagiosadmin`
`Password: nagios`

## Verify monitored hosts

In Nagios, go to:

`Hosts → Host Status`

By default, Nagios monitors `localhost`.

## Conclusion

With Docker, you can deploy a full Nagios monitoring stack in minutes.

This approach is ideal for labs, training environments, tests, and DevOps/cybersecurity projects.
