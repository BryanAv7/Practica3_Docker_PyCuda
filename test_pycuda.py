import pycuda.driver as drv
import pycuda.autoinit

print("PyCUDA cargado correctamente")
print("Número de GPUs disponibles:", drv.Device.count())
print("Nombre GPU 0:", drv.Device(0).name())
