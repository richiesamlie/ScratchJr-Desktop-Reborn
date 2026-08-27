import {gn, getUrlVars} from '../utils/lib';

let place: string;

export function gettingStartedMain () { // eslint-disable-line import/prefer-default-export
    gn('closeHelp')!.onclick = gettingStartedCloseMe;
    gn('closeHelp')!.onmousedown = gettingStartedCloseMe;
    var videoObj = gn('myVideo')! as HTMLVideoElement;
    videoObj.src = 'assets/lobby/intro.mp4';
    videoObj.poster = 'assets/lobby/poster.png';

    var urlvars = getUrlVars();
    place = urlvars.place;
    document.onmousemove = function (e){
        e.preventDefault();
    };
}


function gettingStartedCloseMe () {
    window.location.href = 'home.html?place=' + place;
}
