Hongik Univ. Notice-Hook for Discord
---
***
**Discord플랫폼을 위한 홍익대학교 공지알림 웹훅입니다.**
***
## JavaScrpt Dependencies

- axios
- node-scheduler
- cheerio
- url

## Requried Node.js Runtime Version

- Upper than v.18

***
## Dockerfile execution infromation

- Base Image : Node v16
- Working Directory : /apps
- Exported container volume
    - /apps

```bash
docker build -t (image name) .
```
```
docker run -it -d -v $(pwd):/apps --name (container name) (image name) bash
```
```
docker exec -it (container name) bash
```
```
# In container : Consider as after you enter your webhook endpoint to config

npm install
# Discord
npm run run-discord 
# Slack
npm run run-slack