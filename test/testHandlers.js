const request = require('supertest');
const { requestListener } = require('../handlers');

describe('Home Page', function() {
  it('should give home page / path', function(done) {
    request(requestListener)
      .get('/')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', '707')
      .expect(/Flower Catalog/);
  });
});

describe('Abeliophyllum', function() {
  it('should get page for a given valid path', function(done) {
    request(requestListener)
      .get('/abeliophyllum.html')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', '1250');
  });
});

describe('Tamplate GuestBook', function() {
  it('should give guestBook page', function(done) {
    request(requestListener)
      .get('/guestBook.html')
      .expect(200)
      .expect('Content-Type', 'text/html', done);
  });
});
