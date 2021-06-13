// jshint esversion: 9

const fp = {};

fp.pipe = (...fns) => {
  return init => fns.reduce((v, f) => f(v), init);
};

fp.clone = obj => JSON.parse(JSON.stringify(obj));

fp.formatDate = date => {
  date = new Date(date);
  const mon = date.getMonth() + 1;
  const fmon = mon < 10 ? `0${mon}` : `${mon}`;
  
  const dt = date.getDate();
  const fdate = dt < 10 ? `0${dt}` : `${dt}`;
  
  return `${date.getFullYear()}-${fmon}-${fdate}`;
};

fp.addTime = (date, period, amount, formatted = true) => {

  const newDate = new Date(date);
  
  const setPeriod = {
    year: function (date, amount)  {
      return newDate.setFullYear(date.getFullYear() + amount);
    }
  };
  
  return formatted ? fp.formatDate(setPeriod[period](date, amount))
    : setPeriod[period](date, amount);  
};

if ('undefined' !== module) module.exports = fp;