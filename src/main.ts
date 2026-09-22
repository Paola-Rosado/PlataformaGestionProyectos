// Crea la aplicación de Vue.
import { createApp } from 'vue'

// Componente principal.
import App from './App.vue'

// Router de la aplicación.
import router from './router'

// Crea la aplicación.
const app = createApp(App)

// Activa Vue Router.
app.use(router)

// Monta Vue dentro del elemento #app de index.html.
app.mount('#app')