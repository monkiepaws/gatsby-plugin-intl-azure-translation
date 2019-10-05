const jaFlat = ['偉大なタイトル', '素晴らしい説明', '次に', '先の', '404 ここには何もない!', 'ガーデンステート', 'サンシャイン州']
const frFlat = ['Grand Titre', 'Description impressionnante', 'prochain', 'précédent', '404 rien ici!', 'État de jardin', 'État de soleil']
const flatArray = [["ja", jaFlat], ["fr", frFlat]]

const flat = new Map(flatArray)

const jaShaped = {
  site: {
    title: '偉大なタイトル',
    description: '素晴らしい説明',
    nav: {
      next: '次に',
      prev: '先の'
    }
  },
  notfound: '404 ここには何もない!',
  state: {
    vic: 'ガーデンステート',
    qld: 'サンシャイン州'
  }
}
const frShaped = {
  site: {
    title: 'Grand Titre',
    description: 'Description impressionnante',
    nav: {
      next: 'prochain',
      prev: 'précédent'
    }
  },
  notfound: '404 rien ici!',
  state: {
    vic: 'État de jardin',
    qld: 'État de soleil'
  }
}
const shapedArray = [["ja", jaShaped], ["fr", frShaped]]

const shaped = new Map(shapedArray)

const mockMaps = { flat, shaped }

module.exports = mockMaps
