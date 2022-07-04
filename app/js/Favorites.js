import { GithubUser } from './GithubUser.js'

//Estrutura dos DADOS
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já cadastrado')
      }
      const user = await GithubUser.search(username)

      if (user === undefined) {
        throw new Error('usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filterdEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filterdEntries
    this.update()
    this.save()
  }
}

//Manipulação do DOM
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('header button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('header input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = ` https://github.com/${user.login}.png`

      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name

      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('button').onclick = () => {
        const isOK = confirm('Tem certeza que deseja deletar esta linha?')

        if (isOK) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
      <td class='user'>
        <img src="" alt="" />
        <div>
        <a href="">
          <p><p>  
        </a>
          <span></span>
        </div>
      </td>
      <td class="repositories"></td>
      <td class="followers"></td>
      <td><button>Remover</button></td>
    
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
