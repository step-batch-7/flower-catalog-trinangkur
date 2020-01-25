const hideFor1Sec = function(element) {
  element.classList.add('hide');
  setTimeout(() => element.classList.remove('hide'), 1000);
};
