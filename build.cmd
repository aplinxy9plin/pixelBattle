@ECHO OFF
ng build --prod
ECHO ok =========> next job docker build
docker build -t sydykov/pixelbattle .
ECHO ok --------=> next job docker push
docker push sydykov/pixelbattle
PAUSE
