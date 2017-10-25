import Ember from 'ember';
import config from '../../config/environment';

const {
  inject: { service },
  isPresent
} = Ember;

export default Ember.Route.extend({
  websockets: service(),
  state: false,
  questions: null,

  beforeModel(){
    const socket = this.get('websockets').socketFor(config.ADDRESS+'7000/');
    const asocket = this.get('websockets').socketFor(config.ADDRESS+'1111/');

    socket.on('message', function (message) {
      message = JSON.parse(message.data);
      console.log(message);
      if(message.type === "interview") {
        this.set('currentModel.state', true);
        this.set('currentModel.questions', message.questions);
        this.set("ans",null);
      } else if(message.type === "stop") {
        this.set('currentModel.state',false);
        this.set('currentModel.questions', null)
      }}, this);

    this.set('socketRef', asocket);
  },

  model(){
    return {
      state: false,
      questions: null
    }
  },

  actions: {
    vote(val){
      this.set("ans",val);
    },

    answer(){
      const ans = this.get('ans');
      if(isPresent(ans)){
          this.get('socketRef').send(JSON.stringify({
          type: "answer",
          id: ans
        }))
      }
      this.set('currentModel.state',false);
    }
  }
});
