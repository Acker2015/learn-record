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



//-----------------------time--------------------------
let diff = "";
let day = Date.now();
let timeEle = document.querySelector('.time');
Rx.Observable.interval(1000).subscribe(() => {
    diff = moment(day).fromNow();
    timeEle.innerText = diff;
})

//----------------------house&money-------------------\
let moneyEle = document.querySelector('.money');
let houseEle = document.querySelector('.house');
//house
const house$ = new Rx.Subject();
const houseCount$ = house$.scan((acc, num) => acc + num, 0)
    .startWith(0);
//fixed salary, 10000
const salary$ = Rx.Observable.interval(1000).mapTo(10000);
//rent
const rent$ = Rx.Observable.interval(3000)
    .withLatestFrom(houseCount$)
    .map(arr => arr[1] * 4500);
//have money, go to buy house
const income$ = Rx.Observable.merge(salary$, rent$)
const cash$ = income$
    .scan((acc, num) => {
        const newSum = acc + num;
        const newHouse = Math.floor(newSum / 2000000);
        if(newHouse > 0){
            house$.next(newHouse);
        }
        return newSum % 2000000;
    }, 0)

cash$.subscribe(num => {
    moneyEle.innerText = 'money: ' + num;
})
houseCount$.subscribe(num => {
    houseEle.innerText = 'num of house: ' + num;
})
salary$.subscribe(m => {
    console.log('salary: ' + m);
})
rent$.subscribe(m => {
    console.log('rent: ' + m);
})
