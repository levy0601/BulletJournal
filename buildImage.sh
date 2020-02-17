cd ./auth-proxy
docker build -t mwangxx/auth-proxy .
cd ..

cd ./frontend
docker build -t mwangxx/bulletjournal-frontend .
cd ..

cd ./backend
DOCKER_BUILDKIT=1 docker build -t mwangxx/bulletjournal-backend .
cd ..
