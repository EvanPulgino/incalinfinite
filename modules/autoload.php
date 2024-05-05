<?php
spl_autoload_register(function ($class) {
    $BaseDIR = __DIR__;
    $ListDIR = scandir($BaseDIR);
    if (isset($ListDIR) && !empty($ListDIR)) {
        foreach ($ListDIR as $listDirKey => $subDir) {
            $file = $BaseDIR . "/" . $subDir . "/" . $class . ".class.php";
            if (file_exists($file)) {
                require_once $file;
            }
        }
    }
});
