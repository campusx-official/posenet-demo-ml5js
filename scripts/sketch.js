let capture;
let posenet;
let poses = [];
let skeleton;

let counter = 0;

let score_threshold = 0.5;

let height = 480;
let width = 640;

let scaling_factor = 2;
let strokeWeightValue = 5;

let scaled_width = width / scaling_factor;
let scaled_height = height / scaling_factor;

let scaled_x = scaled_width / width;
let scaled_y = scaled_height / height;

function setup() {
  var vidcanvas = createCanvas(scaled_width, scaled_height);

  vidcanvas.parent("vid");
  capture = createCapture(VIDEO);
  capture.hide();

  posenet = ml5.poseNet(capture, modelLoaded);
  posenet.on("pose", (result) => {
    poses = result;

    console.log(poses);

    statusUpdate(poses);
  });
}

function modelLoaded() {
  console.log("model loaded");
  document.getElementById("status").innerHTML = "model loaded";
}

function statusUpdate(poses) {
  if (poses.length > 0) {
    if (poses.length == 1) {
      document.getElementById("status").style.color = "black";
      document.getElementById("status").style.fontSize = "medium";
      document.getElementById("status").style.color = "green";
      document.getElementById("status").innerHTML = "No action needed";
    } else {
      // following codes are written so that it dosen't detect
      // unneccesary objects as a person during quick transition
      // from single-pose mode to multipose-mode

      for (let i = 0; i < poses.length; i++) {
        const multi_pose = poses[i].pose;

        for (let j = 0; j < multi_pose.keypoints.length; j++) {
          const multi_keypoint = multi_pose.keypoints[j];

          if (multi_keypoint.score > score_threshold && i > 1) {
            document.getElementById(
              "status"
            ).innerHTML = `${poses.length} persons detected`;
            document.getElementById("status").style.color = "red";
            document.getElementById("status").style.fontSize = "x-large";
            counter++;
            break;
          }
        }
      }
    }
  } else {
    document.getElementById("status").innerHTML = "No person detected";
    document.getElementById("status").style.color = "red";
    document.getElementById("status").style.fontSize = "x-large";
    counter++;
  }
  if (counter > 0) {
    document.getElementById("cnt").innerHTML = counter;
    document.getElementById("cnt").style.color = "red";
  }
}

function draw() {
  const pv = document.getElementById("preview");

  if (pv.checked) {
    document.getElementById("vid").style.display = "block";
    document.getElementById("switch").disabled = false;

    image(capture, 0, 0, scaled_width, scaled_height, 0, 0, width, height);

    const sw = document.getElementById("switch");

    if (sw.checked) {
      drawKeypoints();
      drawSkeleton();
    }
  } else {
    document.getElementById("switch").disabled = true;
    document.getElementById("vid").style.display = "none";
  }
}

function drawKeypoints() {
  for (let i = 0; i < poses.length; i++) {
    const pose = poses[i].pose;

    for (let j = 0; j < pose.keypoints.length; j++) {
      const keypoint = pose.keypoints[j];

      if (keypoint.score > score_threshold) {
        fill(0, 255, 0);
        ellipse(
          keypoint.position.x * scaled_x,
          keypoint.position.y * scaled_y,
          strokeWeightValue / scaling_factor,
          strokeWeightValue / scaling_factor
        );
      }
    }
  }
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    const skeleton = poses[i].skeleton;

    for (let j = 0; j < skeleton.length; j++) {
      const src = skeleton[j][0];
      const dst = skeleton[j][1];

      stroke(0, 255, 0);
      strokeWeight(strokeWeightValue / scaling_factor);

      line(
        src.position.x * scaled_x,
        src.position.y * scaled_y,
        dst.position.x * scaled_x,
        dst.position.y * scaled_y
      );
    }
  }
}
