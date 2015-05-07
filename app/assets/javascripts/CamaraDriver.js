/**
 * Created by ivan on 5/05/15.
 */
var mediaConstraints = { audio: !!navigator.mozGetUserMedia, video: true };

var mediaRecorder;
function onMediaSuccess(stream) {
    var video = document.createElement('video');
    video.setAttribute("id", "video-player");
    var videoWidth = document.getElementById('video-width').value || 320;
    var videoHeight = document.getElementById('video-height').value || 240;
    video = mergeProps(video, {
        controls: false,
        width: videoWidth,
        height: videoHeight,
        src: URL.createObjectURL(stream)
    });

    video.play();

    videosContainer.appendChild(video);
    videosContainer.appendChild(document.createElement('hr'));

    
    mediaRecorder = new MediaStreamRecorder(stream);
    mediaRecorder.mimeType = 'video/webm'; // this line is mandatory
    mediaRecorder.videoWidth  = videoWidth;
    mediaRecorder.videoHeight = videoHeight;
    mediaRecorder.ondataavailable = function(blob) {
        
        var a = document.createElement('a');
        a.target = '_blank';
        a.innerHTML = 'Open Recorded Video No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') :';
        a.href = URL.createObjectURL(blob);

        uploaded_videos_container.appendChild(a);
        uploaded_videos_container.appendChild(document.createElement('hr'));

        var fileType = 'video'; // or "audio"
        var fileName = 'test.webm';  // or "wav" or "ogg"

        var formData = new FormData();
        formData.append(fileType + '-filename', fileName);
        formData.append(fileType + '-blob', blob);



        send_video_ajax(url_ajax, formData, function (fileURL) {
            window.open(fileURL);
        });

     
    };

    // get blob after specific time interval
    mediaRecorder.start(timeInterval);

    document.querySelector('#stop-recording').disabled = false;
    document.querySelector('#snapshot').disabled = false;
}
function onMediaError(e) {
    console.error('media error', e);
}


// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)),10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

window.onbeforeunload = function() {
    document.querySelector('#start-recording').disabled = false;
};




function capture(video, scaleFactor) {
    if(scaleFactor == null){
        scaleFactor = 1;
    }
    var w = document.getElementById('video-width').value * scaleFactor;
    var h = document.getElementById('video-height').value * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}



   function send_video_ajax(url, data, callback) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    callback(location.href + request.responseText);
                }
            };    
            $.ajax({
                    url: url,  //Server script to process data
                    type: 'POST',
                    // xhr: function() {  // Custom XMLHttpRequest
                    //     var myXhr = $.ajaxSettings.xhr();
                    //     if(myXhr.upload){ // Check if upload property exists
                    //         myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // For handling the progress of the upload
                    //     }
                    //     return myXhr;
                    // },
                    //Ajax events
                    // beforeSend: beforeSendHandler,
                    // success: completeHandler,
                    // error: errorHandler,
                    // Form data
                    data: data,
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function() {
                  alert('En esta funcion hay que crear el formulario para actualizar los datos de este video')
                });
// Groso que te explica como hacerlo
// https://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously
            // request.open('POST', url);
            // request.send(data);
        }


function progressHandlingFunction(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}