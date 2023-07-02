import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

output_dirpath = "./output"

loglevel_dirpath = f"{output_dirpath}/loglevel"
thread_dirpath = f"{output_dirpath}/thread"
classe_dirpath = f"{output_dirpath}/classe"
logtype_dirpath = f"{output_dirpath}/logtype"

busca_nativa = []

def get_filename(path: str):
    if "/" in path:
        return path.split('/').pop()
    elif "\\" in path:
        return path.split('\\').pop()
    return path

def get_firstfile():
    dir_filepaths = os.listdir('./')
    for path in dir_filepaths:
        filepath = Path(path)
        if filepath.is_file() and path != "reader.py":
            return path

def transform_size(size: int):
    size_unity = ["b", "kb", "mb", "gb"]
    transformed_size = float(size)
    division  = 0
    while (transformed_size >= 1024):
        transformed_size /= 1024
        division += 1

    rounded_transformed_size = int(transformed_size * 10) / 10 if transformed_size < 100 else int(transformed_size)
    if rounded_transformed_size == int(rounded_transformed_size):
        rounded_transformed_size = int(rounded_transformed_size)
    
    return f"{rounded_transformed_size}{size_unity[division]}"

def transform_time(time: str):
    hour, minute, second = re.match('(.*):(.*):(.*)\.', time).groups()
    hour = int(hour)
    minute = int(minute)
    second = int(second)

    time_str = f"{second}s"
    if minute:
        time_str = f"{minute}m {time_str}"
    if hour:
        time_str = f"{hour}h {time_str}"

    return time_str

def clear_output():
    classe_dir = Path(output_dirpath)
    if classe_dir.exists():
        shutil.rmtree(output_dirpath)

    os.mkdir(output_dirpath)
    os.mkdir(loglevel_dirpath)
    os.mkdir(thread_dirpath)
    os.mkdir(classe_dirpath)
    os.mkdir(logtype_dirpath)

def is_begin_of_log(row: str):
    return True if re.match("^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}", row) else False


def append_in_file(filepath: str, filename: str, text: str):
    appending_file = open(f"{filepath}/{filename}.log", "a")
    appending_file.write(text)
    appending_file.close()


def save_request(log: str):
    match = re.match("\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} *\w* *\[[^\]]*\] *\([^\)]*\) Requisição para (.*)", log)
    if match:
        request_page = match.groups()[0].replace("/", "\\")
        append_in_file(logtype_dirpath, "Requisição", log)

def save_native_query(log: str, thread: str):
    if "Terminou busca nativa!" in log:
        append_in_file(logtype_dirpath, "Busca nativa", log)

    if thread in busca_nativa:
        busca_nativa.remove(thread)
        append_in_file(logtype_dirpath, "Busca nativa", log)

    if "Iniciou busca nativa!" in log:
        busca_nativa.append(thread)
        append_in_file(logtype_dirpath, "Busca nativa", log)


def save_log(log: str):
    match = re.match("\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} *(\w*) *\[([^\]]*)\] *\(([^\)]*)\)", log)
    if not match:
        return

    loglevel, classe, thread = match.groups()

    loglevel = loglevel.replace("/", "-")
    classe = classe.replace("/", "-")
    thread = thread.replace("/", "-")

    append_in_file(loglevel_dirpath, loglevel, log)
    append_in_file(classe_dirpath, classe, log)    
    append_in_file(thread_dirpath, thread, log)

    save_request(log)
    save_native_query(log, thread)


def read_file(path: str):
    timestart = datetime.now()
    log_file = open(path, 'r', errors="ignore")
    print(f"Lendo arquivo \"{get_filename(path)}\". ({transform_size(os.path.getsize(path))})")

    current_row = log_file.readline()

    while current_row and not is_begin_of_log(current_row):
        current_row = log_file.readline()

    if not current_row:
        return

    log = current_row
    log_count = 1

    current_row = log_file.readline()
    while current_row:
        if is_begin_of_log(current_row):
            log_count += 1
            save_log(log)
            log = current_row
        else:
            log += current_row

        current_row = log_file.readline()

    save_log(log)

    log_file.close() 
    print(f"{log_count:,} logs processados.".replace(",", "."))
    print(f"Tempo de execução: {transform_time(str(datetime.now() - timestart))}")


def start():
    clear_output()

    if len(sys.argv) >= 2:
        path = sys.argv[1]
        if Path(path).is_file():
            read_file(path)
        else:
            print("Arquivo \"" + path + "\" não foi encontrado.")
    else:
        file_in_folder = get_firstfile()
        if file_in_folder:
            read_file(file_in_folder)
        else:
            print("Nenhum arquivo na pasta.")

    # Verifica se todos os arquivos foram processados
    print("Processamento concluído.")

os.system('cls')
start()
