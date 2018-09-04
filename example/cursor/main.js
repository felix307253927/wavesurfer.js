'use strict';

// Create an instance
var wavesurfer = {};

// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    wavesurfer = WaveSurfer.create({
        container: document.querySelector('#waveform'),
        plugins: [WaveSurfer.cursor.create(), WaveSurfer.timeline.create({
            container: '#wave-timeline'
        })]
    });

    // Load audio from URL
    wavesurfer.load('../media/demo.wav');

    // Play button
    var button = document.querySelector('[data-action="play"]');

    button.addEventListener('click', wavesurfer.playPause.bind(wavesurfer));
});
