/**
 * Created by ivan on 5/05/15.
 */
var media_constraints = { audio: !!navigator.mozGetUserMedia, video: true };
var time_interval = 7200 * 1000;
var media_recorder;
var index = 1;
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

    videos_container.appendChild(video);
    videos_container.appendChild(document.createElement('hr'));
    
    media_recorder = new MediaStreamRecorder(stream);
    media_recorder.mimeType = 'video/webm'; // this line is mandatory
    media_recorder.videoWidth  = videoWidth;
    media_recorder.videoHeight = videoHeight;
    media_recorder.ondataavailable = function(blob) {
        var fileType = 'video'; // or "audio"
        var fileName = 'test.webm';  // or "wav" or "ogg"
        var form_data = new FormData();
        form_data.append(fileType + '-filename', fileName); //CREO QUE ESTO NO VA MAS!
        form_data.append(fileType + '-blob', blob);
        form_data.append('height',document.getElementById('video-height').value)
        form_data.append('width',document.getElementById('video-width').value)        
        sendVideoAjax(url_ajax, form_data,blob, function (fileURL) {
            window.open(fileURL);
        });
};

    // get blob after specific time interval
    media_recorder.start(time_interval);

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

function capture(video, scale_factor) {
    if(scale_factor == null){
        scale_factor = 1;
    }
    var w = document.getElementById('video-width').value * scale_factor;
    var h = document.getElementById('video-height').value * scale_factor;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}

function sendVideoAjax(url, data, blob,callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(location.href + request.responseText);
        }
    };    
    $.ajax({
        url: url,  //Server script to process data
        type: 'POST',                            
        // beforeSend: beforeSendHandler,
        // success: completeHandler,
        // error: errorHandler,    
        data: data,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {
            insertFormForVideo(blob,data.video_id);
            return data;
        },
        error: function() {
            alert('Error occured');
        }
    });
// Groso que te explica como hacerlo
// https://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously
        }

function sendImageAjax(url, data, blob,callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            callback(location.href + request.responseText);
            }
        };    
    $.ajax({
        url: url,  //Server script to process data
        type: 'POST',                    
        data: data,
        //Options to tell jQuery not to process data or worry about content-type.
        cache: false,
        contentType: false,
        processData: false
    });
}

function insertFormForVideo(blob,video_id) {

    var a = document.createElement('a');
    a.target = '_blank';
    a.innerHTML = 'Open Recorded Video No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') :';
    a.href = URL.createObjectURL(blob);
    uploaded_videos_container.appendChild(a);

    var name_label = document.createElement("label");                          
    name_label.innerHTML = 'Name of the video'
    name_label.ClassName='string optional control-label'                                              
    var name = document.createElement("input"); 
    name.name='name';
    name.className='string optional form-control';

    var hiden_video_id = document.createElement("input");
    hiden_video_id.name='hiden_video_id';
    hiden_video_id.type = 'hidden';
    hiden_video_id.value = video_id;

    var description_label = document.createElement("label");                          
    description_label.innerHTML = 'Description of the video';
    description_label.ClassName='string optional control-label';
    var description = document.createElement("input");  
    description.name='description';
    description.className='string optional form-control';

    var meters_label = document.createElement("label");                          
    meters_label.innerHTML = 'Meters'
    meters_label.ClassName='string optional control-label'                                              
    var meters = document.createElement("input");  
    meters.name='meters';
    meters.type='number'
    meters.step='any';
    meters.className='numeric decimal optional form-control';            

    var submit = document.createElement("input");  
    submit.type='button';
    submit.name='commit';
    submit.value='Upload metadata';
    submit.onclick = sendMetadataAjax;
    submit.className='btn btn-success';

    var form = document.createElement("form");
    form.method = "POST";
    form.setAttribute("id", "video-form-metadata");
    form.appendChild(name_label);
    form.appendChild(name);  
    form.appendChild(description_label);
    form.appendChild(description);
    form.appendChild(meters_label);                        
    form.appendChild(meters);
    form.appendChild(submit);
    form.appendChild(hiden_video_id);
    uploaded_videos_container.appendChild(form)  
    uploaded_videos_container.appendChild(document.createElement('hr'));                         
}    

function sendMetadataAjax(){
    var queryString = $('#video-form-metadata').serialize();
       $.ajax({
            type: "POST",
            url: url_video_metadata_ajax,
            data: queryString,
            contentType: "application/x-www-form-urlencoded",
        });

    var element = document.getElementById("video-form-metadata");
    element.parentNode.removeChild(element);
    uploaded_videos_container.innerHtml += 'Metadata Uploaded!';
    uploaded_videos_container.appendChild(document.createTextNode('Metadata Uploaded!'));
}