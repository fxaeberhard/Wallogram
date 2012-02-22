package com.pblabs.rendering2D
{
    import flash.display.BitmapData;
    import flash.geom.Matrix;

    /**
     * This interface is implemented by objects that support a fast bitmap 
     * render path. It is fully optional.
     */
    public interface ICopyPixelsRenderer
    {
        /**
         * In some cases, you want to fall back to normal displayObject 
         * rendering. For instance, flipping might not be supported. If
         * this is the case, return false and the normal draw path will 
         * be used.
         */ 
        function isPixelPathActive(objectToScreen:Matrix):Boolean
        
        /**
         * Draw to a bitmap directly. 
         * @param objectToScreen Transform from object space to renderTarget space.
         * @param renderTarget Bitmap to which to draw.
         */
        function drawPixels(objectToScreen:Matrix, renderTarget:BitmapData):void;
    }
}