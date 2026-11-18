// weBlogger - punto de entrada del binario de escritorio.
// En release se oculta la consola de Windows; en debug se deja para ver logs.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    weblogger_lib::run();
}
