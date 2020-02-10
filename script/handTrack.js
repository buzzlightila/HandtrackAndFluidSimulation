const video = document.getElementById('myvideo')
const handimg = document.getElementById('handimage')
const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
let audio

let isVideo = false
let model = null
const screenScale = 2.5

const modelParams = {
  flipHorizontal: true,
  maxNumBoxes: 20,
  iouThreshold: 0.5,
  scoreThreshold: 0.6
}

const startVideo = () => {
  handTrack.startVideo(video).then((status) => {
    if (status) {
      isVideo = true
      runDetection()
    }
  })
}

startVideo()

const updatePointerHand = (pointer, posX, posY) => {
  pointer.prevTexcoordX = pointer.texcoordX
  pointer.prevTexcoordY = pointer.texcoordY
  pointer.texcoordX = posX / fluid.width
  pointer.texcoordY = 1.0 - posY / fluid.height
  pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX)
  pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY)
  pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0
}

const runDetection = () => {
  model.detect(video).then(predictions => {
    if (predictions.length !== 0) {
      const randNum = Math.round(Math.random() * (4 - 1) + 1)
      audio = new Audio(`./sounds/Effect_${randNum}.mp3`)
      audio.volume = 0.2
      audio.play()
      let pointer = pointers.find(p => p.id === -1)
      if (pointer == null) {
        pointer = new pointerPrototype()
      }
      const x = predictions[0].bbox[0] * screenScale
      const y = predictions[0].bbox[1] * screenScale
      updatePointerHand(pointer, scaleByPixelRatio(x), scaleByPixelRatio(y))
    }

    model.renderPredictions(predictions, canvas, context, video)
    if (isVideo) {
      requestAnimationFrame(runDetection)
    }
  })
}

const runDetectionImage = (img) => {
  model.detect(img).then(predictions => {
    model.renderPredictions(predictions, canvas, context, img)
  })
}

handTrack.load(modelParams).then(lmodel => {
  model = lmodel
  runDetectionImage(handimg)
})
