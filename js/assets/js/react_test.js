const cards = {
    test_ready: testReadyComp(),
    test_wait: document.getElementById('test-wait'),
    test_wait_click: document.getElementById('test-wait-click'),
    test_clicked: document.getElementById('test-clicked'),
    test_record: document.getElementById('test-record'),
};

const main = document.getElementById('main');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const progress = document.getElementById('progress');

// 처음 화면 세팅
repalceCard(cards.test_wait);  
repalceCard(cards.test_wait_click);  
repalceCard(cards.test_clicked);  
repalceCard(cards.test_record);  
repalceCard(cards.test_ready);  

let measureResults = [];

const getRecords = () => {
    const records = {
        max: -1,
        min: -1,
        avg: -1
    };

    let sum = 0;
    for (r of measureResults) {
        records.max = records.max === -1 ? r : records.max > r ? records.max : r;
        records.min = records.min === -1 ? r : records.min < r ? records.min : r;
        sum += r;
    }

    records.avg = sum / 5;
    
    return records;
};

// start-button이 생기기 전에 부르는 것을 주의해야 한다
const startBtn = document.getElementById('start-button');

const startWaitHandler = (e) => {
    repalceCard(cards.test_wait);
    main.classList.remove('measure-end');
    main.classList.add('waiting');
    waitClick();
}

startBtn.addEventListener('click', startWaitHandler);

let measure_start_time;
let measure_end_time;

let measure_id;
let tooFastClickHandler;

function waitClick() {
    main.removeEventListener('click', startWaitHandler);

    // 측정 대기 시작
    measure_id = window.setTimeout(measureStart, parseInt(Math.random() * 4501 + 500));

    // 측정 대기중에 너무 빨리 클릭할 시 처리해줘야 하는 것들
    tooFastClickHandler = (e) => {
        clearTimeout(measure_id);   // 돌아가고 있던 측정 대기 타임아웃 제거
        main.removeEventListener('click', tooFastClickHandler); // 너무 빨리 클릭 이벤트 제거
        alert('Fail! Clicked too early');   // 경고창
        main.classList.remove('waiting');   // 배경색 바꾸기
        measureResults = [];    // 여태까지의 기록 다 날리기
        progressText.innerText = '0 / 5';
        progress.style.width = '0%';
        repalceCard(cards.test_ready);
    }

    window.setTimeout(() => { 
        main.addEventListener('click', tooFastClickHandler)
    }, 10);
}

// 측정이 시작될 때 메인에 잠시 이벤트 붙이기
const measureStartHandler = (e) => {
    measureEnd();
};

function measureStart() {
    measure_start_time = new Date().getTime();  // 측정 시작
    main.classList.remove('waiting');
    repalceCard(cards.test_wait_click);
    main.removeEventListener('click', tooFastClickHandler);
    main.addEventListener('click', measureEnd);
}

function measureEnd() { 
    measure_end_time = new Date().getTime();    // 측정 완료
    const result = (measure_end_time - measure_start_time);
    measureResults.push(result);
    progressText.innerText = `${measureResults.length} / 5`;
    progress.style.width = `${measureResults.length*20}%`;
    
    if (measureResults.length < 5) {
        const to_show = cards.test_clicked;
        to_show.querySelector('.millisec').innerText = `${result} ms`;
        main.classList.add('measure-end');
        repalceCard(to_show);
    
        main.removeEventListener('click', measureEnd);
        main.addEventListener('click', startWaitHandler);
    } else {
        const to_show = cards.test_record;

        const records = getRecords();
        
        to_show.querySelector('.avg-time > .millisec').innerText = records.avg;
        to_show.querySelector('.best-time > .millisec').innerText = records.min;
        to_show.querySelector('.worst-time > .millisec').innerText = records.max;
        
        main.classList.add('finish');
        repalceCard(to_show);
        main.removeEventListener('click', measureEnd);
        
        const try_again_button = to_show.querySelector('.try-again-button');
        try_again_button.addEventListener('click', retry);
    }
}

function retry() {
    repalceCard(cards.test_ready);
    main.classList.remove('finish');
    measureResults = [];
    progressText.innerText = '0 / 5';
    progress.style.width = '0%';
    startBtn.addEventListener('click', startWaitHandler);
}

function repalceCard(card) {
    // firstChild는 첫 번째 노드를 가져온다 (텍스트 노드도 포함)
    // firstElementChild는 첫 번재 요소를 가져온다
    const currCard = main.firstElementChild;
    main.replaceChild(card, currCard);
}

function testReadyComp() {
    const wrapper = document.createElement('div');
    wrapper.id = 'test-ready';

    const icon = document.createElement('div');
    icon.classList.add('main-icon');
    wrapper.appendChild(icon);

    const title = document.createElement('div');
    const titleText = document.createTextNode('React Time Test');
    title.classList.add('title');
    title.appendChild(titleText);
    wrapper.appendChild(title);

    const button = document.createElement('div');
    const buttonText = document.createTextNode('Start');
    button.id = 'start-button';
    button.appendChild(buttonText);
    wrapper.appendChild(button);

    return wrapper;
}

