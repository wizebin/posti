<?php
set_error_handler("exception_error_handler");

  function getPostOrJsonBody() {
    if (isset($_POST) && count($_POST) > 0) return $_POST;
    else if (isset($_GET) && count($_GET) > 0) return $_GET;
    $input=file_get_contents('php://input');
    return json_decode($input,true);
  }

  function detectMimeType($content) {
    if (strlen($content) > 0) {
      if ($content[0] == '{') return 'json';
      else if ($content[0] == '<') return 'xml';
    }
    return '';
  }

  function fixArray($in) {
    if (is_array($in)) foreach ($in as $k => $v) {$in[$k] = fixArray($v);}
    else if (is_string ($in)) return utf8_encode($in);
    return $in;
  }

  class http{
    public $curl = null;
    public $url = '';
    public $verb = '';
    public $headers = [];
    public $content = '';
    public $username = '';
    public $password = '';
    public $debug = [];

    public $status = null;
    public $body = null;
    public $err = null;

    public $effectiveUrl = null;
    public $totalTime = null;
    public $lookupTime = null;
    public $connectTime = null;
    public $sizeDown = null;
    public $sizeUp = null;
    public $contentType = null;
    public $ip = null;

    function __construct($encoded) {
      $this->requestEncoded($encoded);
    }

    public function setUrl() {
      $parsedUrl = $this->url;
      if ($this->verb == 'GET') $parsedUrl = $parsedUrl . '?' . $this->content;
      curl_setopt($this->curl, CURLOPT_URL, $parsedUrl);
    }

    public function setPostFields() {
      if ($this->verb == 'POST' || $this->verb == 'PATCH' || $this->verb == 'PUT' || $this->verb == 'DELETE') {
        curl_setopt($this->curl, CURLOPT_POSTFIELDS, $this->content);
      }
    }

    public function guessHeaders() {
      $mime = detectMimeType($this->content);
      if ($mime == 'json') {
        return array('Accept: application/json');
      } else if ($mime == 'xml') {
        return array('Accept: application/xml');
      }

      return array('Accept: text/plain');
    }

    public function setHeaders() {
      if (count($this->headers) > 0) {
        curl_setopt($this->curl, CURLOPT_HTTPHEADER, $this->headers); //expected to be in an array('header: value', 'other header: value');
        array_push($this->debug, $this->headers);
      }
      else
        curl_setopt($this->curl, CURLOPT_HTTPHEADER, $this->guessHeaders());
    }

    public function setPostType() {
      if ($this->verb == 'POST') {
        curl_setopt($this->curl, CURLOPT_POST, true);
      } else if ($this->verb == 'PUT') {
        curl_setopt($this->curl, CURLOPT_POST, true);
      } else if ($this->verb == 'GET') {

      }
      curl_setopt($this->curl, CURLOPT_CUSTOMREQUEST, $this->verb);
    }

    public function setCredentials() {
      if (is_string($this->username) && $this->username != '') {
        curl_setopt($this->curl, CURLOPT_USERNAME, $this->username);
      }
      if (is_string($this->password) && $this->password != '') {
        curl_setopt($this->curl, CURLOPT_PASSWORD, $this->password);
      }
    }

    public function http() {
      $this->curl = curl_init();
      curl_setopt($this->curl, CURLOPT_SSL_VERIFYPEER, false);
      curl_setopt($this->curl, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($this->curl, CURLOPT_FAILONERROR, false);
      curl_setopt($this->curl, CURLOPT_FOLLOWLOCATION, true);

      $this->setHeaders();
      $this->setPostType();
      $this->setPostFields();
      $this->setUrl();

      $this->body = curl_exec($this->curl);

      $this->status = curl_getinfo($this->curl, CURLINFO_RESPONSE_CODE);
      $this->effectiveUrl = curl_getinfo($this->curl, CURLINFO_EFFECTIVE_URL);
      $this->totalTime = curl_getinfo($this->curl, CURLINFO_TOTAL_TIME);
      $this->lookupTime = curl_getinfo($this->curl, CURLINFO_NAMELOOKUP_TIME);
      $this->connectTime = curl_getinfo($this->curl, CURLINFO_CONNECT_TIME);
      $this->sizeDown = curl_getinfo($this->curl, CURLINFO_SIZE_DOWNLOAD);
      $this->sizeUp = curl_getinfo($this->curl, CURLINFO_REQUEST_SIZE);
      $this->contentType = curl_getinfo($this->curl, CURLINFO_CONTENT_TYPE);
      $this->ip = curl_getinfo($this->curl, CURLINFO_PRIMARY_IP);
      $this->err = curl_error($this->curl);

      curl_close($this->curl);

      return $this;
    }

    public function requestEncoded($encoded) {
      if (isset($encoded['url']))
        $this->url = $encoded['url'];
      if (isset($encoded['verb']))
        $this->verb = $encoded['verb'];
      if (isset($encoded['headers'])){
        $this->headers = $encoded['headers'];
      } else {
        array_push($this->debug, $encoded);
      }
      if (isset($encoded['mime'])){
        $this->mime = $encoded['mime'];
        if (strtolower($this->mime) == 'json'){
          $encoded['parameters']=json_decode($encoded['parameters']);
        }
      }
      if (isset($encoded['parameters']))
        $this->content = $encoded['parameters'];
      if (isset($encoded['username']))
        $this->username = $encoded['username'];
      if (isset($encoded['password']))
        $this->password = $encoded['password'];

      return $this->http();
    }

    public function toReturnArray() {
      $ret = array();
      $ret['status']=$this->status;
      $ret['body']=$this->body;
      $ret['err']=$this->err;
      $ret['effectiveUrl']=$this->effectiveUrl;
      $ret['totalTime']=$this->totalTime;
      $ret['lookupTime']=$this->lookupTime;
      $ret['connectTime']=$this->connectTime;
      $ret['sizeDown']=$this->sizeDown;
      $ret['sizeUp']=$this->sizeUp;
      $ret['contentType']=$this->contentType;
      $ret['ip']=$this->ip;
      $ret['debug']=$this->debug;
      return $ret;
    }

  }
  function exception_error_handler($errno, $errstr, $errfile, $errline){
    if (error_reporting()) { // skip errors that were muffled
        $ret = array("error" => $errstr, "file" => $errfile, "line" => $errline);
        echo(json_encode($ret));
        die;
    }
  }
  $tmp = new http(getPostOrJsonBody());
  $tmpo = $tmp->toReturnArray();
  echo(json_encode(fixArray($tmpo)));
?>