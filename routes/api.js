'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {

  const translator = new Translator();

  app.route('/api/translate')
    .post((req, res) => {
      const { text, locale } = req.body;
      const languageArray = ['british-to-american', 'american-to-british']

      if (!locale)
        res.json({ error: 'Required field(s) missing' });
      else if (!text)
        res.json({ error: 'No text to translate' });
      else if (languageArray.indexOf(locale) == -1)
        res.json({ error: 'Invalid value for locale field' });
      else {
        let traanslation = translator.translateString(text, languageArray.indexOf(locale));
        traanslation = (traanslation == text) ? 'Everything looks good to me!' : traanslation;
        res.json({ text, traanslation });
      }

    });
};
