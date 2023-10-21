const cam = document.querySelector('#video');
var actualEmotionNumber = 0; // NEUTRO

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo())

async function startVideo(){
    const constraints = { video: true }

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);

        cam.srcObject = stream;
        cam.onloadedmetadata = () => {
            cam.play();
        }
    } catch (error) {
        console.error(error)
    }
}

cam.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(cam)
    document.body.append(canvas)

    const displaySize = { 
        width: cam.width,
        height: cam.height
     }


    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
            cam,
            new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)

        const emotionsValuesAccurance = [detections[0].expressions.neutral.toFixed(4), detections[0].expressions.happy.toFixed(4), detections[0].expressions.sad.toFixed(4), detections[0].expressions.angry.toFixed(4), detections[0].expressions.surprised.toFixed(4)];
        // const emotionsValuesName = ['Neutro', 'Alegre', 'Triste', 'Raivoso', 'Surpreso'];
        const biggestAccuranceEmotion = Math.max.apply(null, emotionsValuesAccurance );
        const positionBiggestAccuranceEmotion = await findPositionInArrayFromValue(emotionsValuesAccurance, biggestAccuranceEmotion);
        
        changeFrontEndByEmotion(positionBiggestAccuranceEmotion, biggestAccuranceEmotion)
        
    }, 1500)
})


async function findPositionInArrayFromValue(arrayUsed, valueSought){
    try {
        for(let currentPosition = 0; currentPosition < arrayUsed.length; currentPosition++){
            if(arrayUsed[currentPosition]==valueSought){
                return currentPosition;
            }
        }
    }catch (error) {
        console.error(error)
    }
}


function changeFrontEndByEmotion(newNumberEmotion, acurrance){

    //AQIOOO
    const emotionsDiv = document.querySelectorAll(".emotion");

    actualEmotionNumber = newNumberEmotion;

    switch (newNumberEmotion) {
        case 0:
        document.getElementById('accuranceNeutral').innerHTML = `${(acurrance*100).toFixed(2)}%`
        emotionsDiv.forEach((div) => {
            div.style.transform = `translateX(0vw)`
        })
            break;
        
        case 1:
        document.getElementById('accuranceHappy').innerHTML = `${(acurrance*100).toFixed(2)}%`
        emotionsDiv.forEach((div) => {
            div.style.transform = `translateX(-25vw)`
        })
            break;

        case 2:
        document.getElementById('accuranceSad').innerHTML = `${(acurrance*100).toFixed(2)}%`
        emotionsDiv.forEach((div) => {
            div.style.transform = `translateX(-50vw)`
        })
            break;

        case 3:
        document.getElementById('accuranceAngry').innerHTML = `${(acurrance*100).toFixed(2)}%`
        emotionsDiv.forEach((div) => {
            div.style.transform = `translateX(-75vw)`
        })
            break;

        case 4:
            document.getElementById('accuranceSurprised').innerHTML = `${(acurrance*100).toFixed(2)}%`
            emotionsDiv.forEach((div) => {
                div.style.transform = `translateX(-100vw)`
            })
            break;
            
        default:
            break;
    }
}