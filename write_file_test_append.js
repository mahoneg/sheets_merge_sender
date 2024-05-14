const fs = require('fs');
 
let data = "This is a file containing a collection of movies.";
let data2 = "This is a file containing a collection of movies.";

function closeFd(fd) {
  fs.close(fd, (err) => {
    if (err) throw err;
  });
}

const fd = fs.openSync('message.txt', 'w', 0o666, (err) => {
  if (err) throw err;
});

  try {
    fs.appendFileSync(fd, 'data to append\n', 'utf8', (err) => {
      closeFd(fd);
      if (err) throw err;
    });

    fs.appendFileSync(fd, 'data to append\n', 'utf8', (err) => {
      closeFd(fd);
      if (err) throw err;
    });
    fs.appendFileSync(fd, 'data to append\n', 'utf8', (err) => {
      closeFd(fd);
      if (err) throw err;
    });
    fs.appendFileSync(fd, 'data to append\n', 'utf8', (err) => {
      closeFd(fd);
      if (err) throw err;
    });
  } catch (err) {
    closeFd(fd);
    throw err;
  } 