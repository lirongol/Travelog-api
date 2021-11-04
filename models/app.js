import mongoose from 'mongoose';

const appSchema = mongoose.Schema({
   tags: {},
}, {timestamps: true})

const App = mongoose.model('App', appSchema);

export default App;