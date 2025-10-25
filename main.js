// Users managment API

const select = document.querySelector('select')

select.addEventListener('focus', function() {
    this.style.backgroundColor = '#101217'
})


const createUserForm = document.querySelector('[data-form]')
const usersWrapper = document.querySelector('[data-users-wrapper]')
const MOCK_API_URL = 'https://68f559556b852b1d6f13ecf3.mockapi.io/users'
let users = []
const modal = document.querySelector('.modal')
const closeModalImg = document.querySelector('.close__modal-btn')
const closeModalBtn = document.querySelector('.btn__close-modal')
const modalDeleted = document.querySelector('.modal__deleted')
const dialogEditUserForm = document.querySelector('[data-edit-user-form-dialog]')

// Делегирование событий
usersWrapper.addEventListener('click', (e) => {
    if(e.target.hasAttribute("data-user-remove-btn")) {
        const confirmDeletedUser = confirm('Вы точно хотите удалить данного пользователя?')
        confirmDeletedUser && deletUserAsync(e.target.dataset.userId)
        return
    }

    if (e.target.hasAttribute("data-user-edit-btn")) {
        populateDialog(e.target.dataset.userId)
        dialogEditUserForm.showModal()
    }
})

// Событие отправки формы для создания пользователя

createUserForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(createUserForm)
    const formUserData = Object.fromEntries(formData)
    
    const newUserData = {
        name: formUserData.userName,
        city: formUserData.userCity,
        email: formUserData.userEmail,
        avatar: formUserData.userImage
    }
    createNewUserAsync(newUserData)
    createUserForm.reset()
    modalWindow()
})

// Получение всех пользователей

const getUsersAsync = async () => {
    try {
        const response = await fetch(MOCK_API_URL)
        users = await response.json()
        renderUsersAsync()
    } catch (error) {
        console.error('Пойманная ошибка:', error.message);
    }
}

const createNewUserAsync = async (newUserData) => {
    try {
        const response = await fetch(MOCK_API_URL, {
            method: 'POST',
            body: JSON.stringify(newUserData),
            headers: {
                "Content-type": "application/json"
            }
        })
        const newCreatedUser = await response.json()
        users.unshift(newCreatedUser)
        renderUsersAsync()
    } catch (error) {
        console.error("Ошибка при создании пользователя:", error.message);
    }
}

const renderUsersAsync = async () => {
    usersWrapper.innerHTML = "";
    users.forEach(user => {
        usersWrapper.insertAdjacentHTML('beforeend', `
            <div class="user__card">
                <h3>${user.name}</h3>
                <p>City:${user.city}</p>
                <span class="email__card">Email:${user.email}</span>
                <img src="${user.avatar}"/>
                <button class="user__edit-btn" data-user-id="${user.id}" data-user-edit-btn>🔨</button>
                <button class="user__remove-btn" data-user-id="${user.id}" data-user-remove-btn>❌</button>
            </div>    
        `)
    })
}

const modalWindow = () => {
    modal.classList.add('active')
    closeModalImg.addEventListener('click', () => {
        modal.classList.remove('active')
    })
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active')
    })
}

const deletUserAsync = async (userId) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${userId}`, {
            method: "DELETE"
        })
        if (response.status === 404) {
            throw new Error(`ID под номером ${userId} - невалидный`)
        }
        const deletedUser = await response.json()
        users = users.filter(user => user.id !== deletedUser.id)
        renderUsersAsync()
        modalDeletedMessage()

    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error.message);
    }
}

const editUserAsync = async (newUserData) => {
    try {
        const response = await fetch(`${MOCK_API_URL}/${newUserData.id}`, {
            method: "PUT",
            body: JSON.stringify(newUserData),
            headers: {
                'Content-type': "application/json"
            }
        })

        if (response.status === 400) {
            throw new Error(`Клиентская ошибка:(`)
        }
        
        const editedUser = await response.json()
        users = users.map(user => {
            if (user.id === editedUser.id) {
                return editedUser
            } else {
                return user
            }
        })
        dialogEditUserForm.close()
        renderUsersAsync()
        alert('Пользователь успешно отредактирован')
    } catch (error) {
        console.error("Ошибка при редактировании пользователя:", error.message);
    }
}

const modalDeletedMessage = () => {
    modalDeleted.classList.add('active__deleted')
    setTimeout(() => {
        modalDeleted.classList.remove('active__deleted')
    }, 1500)
}   

const populateDialog = (userId) => {
    dialogEditUserForm.innerHTML = ""

    const editForm = document.createElement('form')
    const closeFormBtn = document.createElement('button')
    const imageCloseFormBtn = document.createElement('img')

    imageCloseFormBtn.classList.add('close__form-dialog-img')
    imageCloseFormBtn.src = 'images/close__modal-img.svg'
    closeFormBtn.append(imageCloseFormBtn)
    closeFormBtn.classList.add('close__edit-form-btn')
    closeFormBtn.addEventListener('click', () => {
        dialogEditUserForm.close()
    })

    editForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const formData = new FormData(editForm)
        const formUserData = Object.fromEntries(formData)

        const newUserData = {
            id: formUserData.userId,
            name: formUserData.userName,
            city: formUserData.userCity,
            email: formUserData.userEmail,
            avatar: formUserData.userImage
        }

        editUserAsync(newUserData)
    })

    editForm.classList.add('form')
    editForm.innerHTML = `

    <input hidden type="text" name="userId" value=${userId} />

    <div class="control__field">
            <label for="nameId" class="form__label">Name:</label>
            <input type="text" class="form__control" id="nameId" name="userName" required placeholder="Enter name..."
              minlength="2" maxlength="23">
          </div>
          <div class="control__field">
            <label for="cityId" class="form__label">City:</label>
            <input type="text" class="form__control" id="cityId" name="userCity" required placeholder="Enter сity..."
              minlength="2">
          </div>
          <div class="control__field">
            <label for="emailId" class="form__label">Email:</label>
            <input type="email" class="form__control" id="emailId" name="userEmail" required
              placeholder="Enter email...">
          </div>
          <div class="control__field">
            <label for="imageId" class="form__label">Image:</label>
            <select class="form__control form__control-images" id="imageId" name="userImage" required>
              <option value="">Select a picture...</option>
              <hr>
              <option value="https://www.nexplorer.ru/load/Image/1113/koshki_4.jpg">Cat
                1</option>
              <option value="https://www.ptichka.ru/data/cache/2019jul/17/30/97110_50709.jpg">Cat 2</option>
              <option
                value="https://krots.top/uploads/posts/2022-03/1646879019_6-krot-info-p-smeshnaya-mokraya-sobaka-smeshnie-foto-8.jpg">
                Dog 1</option>
              <option
                value="https://www.thesprucepets.com/thmb/hxWjs7evF2hP1Fb1c1HAvRi_Rw0=/2765x0/filters:no_upscale():strip_icc()/chinese-dog-breeds-4797219-hero-2a1e9c5ed2c54d00aef75b05c5db399c.jpg">
                Dog 2</option>
              <option value="https://zoographia.ru/upload/iblock/f5e/h6up57sp4z07z1nsdx8cq5e5514m4bwv.jpg">Enot 1
              </option>
              <option
                value="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-qq8KaUGtnIGJ7MY1CEsWl7PjWsJ3UTeN_A&s">
                Enot 2</option>
              <option value="https://i.pinimg.com/236x/35/82/50/358250be0158c6c303f4ef6d522204b9.jpg">Panda 1</option>
              <option
                value="https://i0.wp.com/revistaamazonia.com.br/wp-content/uploads/2025/04/Coala-dorme-22-horas-por-dia-e-as-outras-passa-comendo.webp?fit=768%2C512&ssl=1">
                Coala 1</option>
            </select>
          </div>
          <button class="btn__form" type="submit">Edit user</button>
    `

    dialogEditUserForm.append(editForm, closeFormBtn)
}

getUsersAsync()
