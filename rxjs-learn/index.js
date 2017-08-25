let refreshButton = document.querySelector('a.refresh');
let close1Button = document.querySelector('a.close1');
let close2Button = document.querySelector('a.close2');
let close3Button = document.querySelector('a.close3');

//event streams
let refreshClickStream = Rx.Observable.fromEvent(refreshButton, 'click');
let close1ClickStream = Rx.Observable.fromEvent(close1Button, 'click');
let close2ClickStream = Rx.Observable.fromEvent(close2Button, 'click');
let close3ClickStream = Rx.Observable.fromEvent(close3Button, 'click');

//streams
let requestStreams = refreshClickStream.startWith('startup click')
    .map(() => {
        let randomOffset = Math.floor(Math.random() * 500);
        return 'https://api.github.com/users?since=' + randomOffset;
    })

let responseStream = requestStreams
    .flatMap(url => {
        return Rx.Observable.fromPromise($.getJSON(url));
    })

let createSuggestionStream = (closeStream) => {
    return closeStream.startWith('startup click')
        .combineLatest(responseStream, (click, listUsers) => {
            return listUsers[Math.floor(Math.random() * listUsers.length)];
        })
        .merge(refreshClickStream.map(() => {
            return null;
        }))
        .startWith(null);
}  
let render = (suggestedUser, selector) => {
    //debugger;
    let ele = document.querySelector(selector);
    if(suggestedUser === null) {
        ele.style.visibility = 'hidden';
    }else{
        ele.style.visibility = 'visible';
        let usernameEl = ele.querySelector('.username');
        usernameEl.href = suggestedUser.html_url;
        usernameEl.textContent = suggestedUser.login;
        var imgEl = ele.querySelector('img');
        imgEl.src = "";
        imgEl.src = suggestedUser.avatar_url;
    }
}

let suggestion1Stream = createSuggestionStream(close1ClickStream);
let suggestion2Stream = createSuggestionStream(close2ClickStream);
let suggestion3Stream = createSuggestionStream(close3ClickStream);

suggestion1Stream.subscribe(suggestedUser => {
    render(suggestedUser, '.suggestion1');
})
suggestion2Stream.subscribe(suggestedUser => {
    render(suggestedUser, '.suggestion2');
})
suggestion3Stream.subscribe(suggestedUser => {
    render(suggestedUser, '.suggestion3');
})