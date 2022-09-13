<?php

// data url string that was uploaded
$data_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgKL93W5//Z';

list($type, $data) = explode(';', $data_url);
list(, $data)      = explode(',', $data);
$data = base64_decode($data);

file_put_contents('test.jpg', $data);

?>