

var htmlNode = document.documentElement;

htmlNode.className =  (function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'MSIE '+('v'+tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\bOPR\/(\d+)/)
        if(tem!= null) return 'Opera v'+tem[1];
    }
    M= M[2]? [M[1], 'v'+M[2]]: [navigator.appName, 'v'+navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, 'v'+tem[1]);
    return M.join(' ');
})();