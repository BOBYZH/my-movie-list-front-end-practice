(function () {
  // new variable
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const displaySwitch = document.querySelector('#display-switch')  //切換檢視功能鍵
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let displayAsLists = false //判斷是否切換檢視
  let defaultPageQuantity = 1 //預設從第一頁開始渲染

  // listen to search form submit event
  searchForm.addEventListener('submit', event => {
    event.preventDefault()

    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    // console.log(results)
    // displayDataList(results)
    getTotalPages(results)
    getPageData(1, results)
  })

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
      console.log(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
      defaultPageQuantity = Number(event.target.dataset.page) //將目前點選的頁數存為預設
    }
  })

  // 切換檢視模式的監聽器
  displaySwitch.addEventListener('click', event => {
    if (event.target.matches('.fa-th')) {
      // console.log("cards")
      displayAsLists = false
      // console.log(displayAsLists)
    } else if (event.target.matches('.fa-bars')) {
      // console.log("lists")
      displayAsLists = true
      // console.log(displayAsLists)
    }
    getPageData(defaultPageQuantity) //接續執行切換檢視模式功能 
  })

  function displayDataList(data) {
    let htmlContent = ''
    data.forEach(function (item) {
      htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h5>
            </div>

            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
            <!-- favorite button --> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlContent
  }

  function displayTrueList(data) { //清單模式的HTML架構
    let htmlContent = ''
    data.forEach(function (item, index) {
      htmlContent += `
        <div class="col-sm-12">
          <div class="card mb-2">
            <div class="row card-body movie-item-body">
              <h6 class="col-sm-9">${item.title}</h6>
              <div class="col-sm-3">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `
    })
    dataPanel.innerHTML = htmlContent
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  axios.get(INDEX_URL)
    .then((response) => {
      data.push(...response.data.results)
      // displayDataList(data)
      getTotalPages(data)
      getPageData(1, data)
    }).catch((err) => console.log(err))

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    // console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      // console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getPageData(pageNum, data) {
    defaultPageQuantity = pageNum || defaultPageQuantity //無既有頁數時，以預設頁數1接續渲染pageData 
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    if (displayAsLists) { //判斷是否使用清單渲染
      displayTrueList(pageData)
    } else {
      displayDataList(pageData)
    }
  }
})()