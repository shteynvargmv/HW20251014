let searchForm = document.forms.movieSearch;
let list = document.querySelector('.list');
let container = document.querySelector('.container');
let radios = document.querySelectorAll('input[type="radio"]');
let moviePageForm = document.forms.moviePage;
let s = '';
let y = '';
let type = '';

const baseUrl = 'http://www.omdbapi.com/';
const apiKey = '964b83be';

document.addEventListener('DOMContentLoaded', async function () {
    let lsData = getLocalStorageData();
    s = lsData[0];
    y = lsData[1];
    type = lsData[2];
    let page = lsData[3];
    let imdbID = lsData[4];
    let data = lsData[5];
    list.innerHTML = '';
    pageOutput(data, page);
    if (imdbID != '') {
        let data = await getMovieById(imdbID);
        detailedOutput(data);
    }
})

container.addEventListener('click', async function () {
    event.stopPropagation();
    if (event.target.classList.contains('close')) {
        $('.detailed').fadeOut(1000);
        let lsData = getLocalStorageData();
        s = lsData[0];
        y = lsData[1];
        type = lsData[2];
        let page = lsData[3];
        data = lsData[5];
        setLocalStorageData(s, y, type, page, data, '');

    } else {
        let card;
        if (event.target.classList.contains('card')) {
            card = event.target;
        }
        if (event.target.parentElement.classList.contains('card')) {
            card = event.target.parentElement;
        }
        if (event.target.parentElement.parentElement.classList.contains('card')) {
            card = event.target.parentElement.parentElement;
        }

        if (card) {
            let imdbID = $('.card-id').filter((i, x) => $(x).parent().is(card)).text();
            if (imdbID != '') {
                let data = await getMovieById(imdbID);
                detailedOutput(data);
                let lsData = getLocalStorageData();
                s = lsData[0];
                y = lsData[1];
                type = lsData[2];
                let page = lsData[3];
                data = lsData[5];
                setLocalStorageData(s, y, type, page, data, imdbID);
            }
        }
    }
})

searchForm.addEventListener('submit', async function () {
    event.preventDefault();
    $('.detailed').css('display', 'none');

    s = searchForm.s.value;
    y = searchForm.y.value;

    if (s.trim()) {

        for (let radio of radios) {
            if (radio.checked) {
                type = radio.value;
            }
        }

        let data = await getMovie(s, type, y);
        page = 0;
        if (data.Response == 'True') {
            page = 1;
        }
        pageOutput(data, page);
        setLocalStorageData(s, y, type, page, data);
    }

    searchForm.reset();

})

async function getMovie(s, type, y, page = 0) {
    if (page == 0) {
        url = `${baseUrl}?apikey=${apiKey}&s=${s}&type=${type}&y=${y}`;
    } else {
        url = `${baseUrl}?apikey=${apiKey}&s=${s}&type=${type}&y=${y}&page=${page}`;
    }
    let response = await fetch(url);
    let data = await response.json();
    return data;
}
async function getMovieById(imdbID) {
    url = `${baseUrl}?i=${imdbID}&apiKey=${apiKey}`;
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

function setLocalStorageData(s, y, type, page, data, imdbID = '') {
    localStorage.setItem('s', s);
    localStorage.setItem('y', y);
    localStorage.setItem('type', type);
    localStorage.setItem('data_page', page);
    localStorage.setItem('movie_data', JSON.stringify(data));
    localStorage.setItem('imdbID', imdbID);
}

function getLocalStorageData() {
    let json = localStorage.getItem('movie_data');
    if (json) {
        data = JSON.parse(json);
    }
    return [localStorage.getItem('s'),
    localStorage.getItem('y'),
    localStorage.getItem('type'),
    localStorage.getItem('data_page'),
    localStorage.getItem('imdbID'),
        data
    ];
}

document.forms.moviePage.addEventListener('submit', async function () {
    event.preventDefault();
    if (event.submitter.classList.contains('left')) {
        dif = -1;
    }
    if (event.submitter.classList.contains('right')) {
        dif = 1;
    }
    if (dif) {
        let pageNumber = document.querySelector('.page-num');
        page = dif + parseInt(pageNumber.textContent);
        let data = await getMovie(s, type, y, page);
        pageOutput(data, page);
        setLocalStorageData(s, y, type, page, data);
    }
})

function pageOutput(data, page) {
    list.innerHTML = '';
    if (data.Response == 'True') {
        for (const search of data.Search) {
            list.innerHTML += `
                <div class="card">      
                    <div class="card-img">
                        <img src="${search.Poster}"
                            class="icon-img" 
                            onerror="this.onerror=null; this.src='./img_not_found.JPG'" alt="">  
                    </div>        
                    <div class="card-title">
                            <b>${search.Title}</b>
                    </div>
                    <div class="card-year">
                            <b>${search.Year}</b>
                    </div>
                    <div class="card-id">${search.imdbID}</div>
                </div>
            `;
        }

        moviePageForm.innerHTML = '';
        moviePageForm.innerHTML +=
            `<button class="btn btn-page left" type="submit">⏪</button>
            <output class="page-num"></output>
            <button class="btn btn-page right" type="submit">⏩</button>`;

        let pageNumber = document.querySelector('.page-num');
        pageNumber.textContent = page;
        if (page == 1) {
            moviePageForm.firstChild.style.display = 'none';
        }
        if (page * 10 >= data.totalResults) {
            moviePageForm.lastChild.style.display = 'none';
        }
    } else {
        moviePageForm.innerHTML = '';
        moviePageForm.innerHTML +=
            `<b class="pagetxt">${data.Error}</b>`;
    }
}

function detailedOutput(data) {
    if (data.Response == 'True') {
        $('.title').text(data.Title);
        $('.genre').text(data.Genre);
        $('.country').text(data.Country);
        $('.rating').text(data.Rating);
        $('.released').text(data.Released);
        $('.runtime').text(data.Runtime);
        $('.director').text(data.Director);
        $('.actors').text(data.Actors);
        $('.awards').text(data.Awards);
        $('.plot').text(data.Plot);
        $('.detailed-img').html('');
        $('.detailed-img').append(`<img src="${data.Poster}"
                            class="detailed-icon-img" 
                            onerror="this.onerror=null; this.src='./img_not_found.JPG'" alt="">`);
        $('.detailed').fadeIn(1000, function () { $(this).css('display', 'grid') });
    }
}


