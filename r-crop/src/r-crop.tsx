import React, {useCallback, useEffect, useRef} from 'react';
import Cropper from 'cropperjs';
import {cleanImageProps} from './utils';

const REQUIRED_IMAGE_STYLES = {opacity: 0, maxWidth: '100%'};

interface RCropElement extends HTMLImageElement {
    cropper: Cropper;
}

type RCropRef =
    | ((instance: HTMLImageElement | RCropElement | null) => void)
    | React.MutableRefObject<HTMLImageElement | RCropElement | null>
    | null;

interface RCropDefaultOptions {
    scaleX?: number;
    scaleY?: number;
    enable?: boolean;
    zoomTo?: number;
    rotateTo?: number;
}

interface RCropProps
    extends RCropDefaultOptions,
        Cropper.Options<HTMLImageElement>,
        Omit<
            React.HTMLProps<HTMLImageElement>,
            'data' | 'ref' | 'crossOrigin'
        > {
    crossOrigin?: '' | 'anonymous' | 'use-credentials' | undefined;
    on?: (
        eventName: string,
        callback: () => void | Promise<void>,
    ) => void | Promise<void>;
    onInitialized?: (instance: Cropper) => void | Promise<void>;
}

const applyDefaultOptions = (
    cropper: Cropper,
    options: RCropDefaultOptions = {},
): void => {
    const {
        enable = true,
        scaleX = 1,
        scaleY = 1,
        zoomTo = 0,
        rotateTo,
    } = options;
    enable ? cropper.enable() : cropper.disable();
    cropper.scaleX(scaleX);
    cropper.scaleY(scaleY);
    rotateTo !== undefined && cropper.rotateTo(rotateTo);
    zoomTo > 0 && cropper.zoomTo(zoomTo);
};

const useCombinedRefs = (
    ...refs: RCropRef[]
): React.RefObject<RCropElement> => {
    const targetRef = useRef<RCropElement>(null);

    React.useEffect(() => {
        refs.forEach((ref) => {
            if (!ref) return;

            if (typeof ref === 'function') {
                ref(targetRef.current);
            } else {
                ref.current = targetRef.current;
            }
        });
    }, [refs]);

    return targetRef;
};

const RCrop = React.forwardRef<RCropElement | HTMLImageElement, RCropProps>(
    (props, ref) => {
        const {
            dragMode = 'crop',
            src,
            style,
            className,
            crossOrigin,
            scaleX,
            scaleY,
            enable,
            zoomTo,
            rotateTo,
            alt = 'picture',
            ready,
            onInitialized,
            ...rest
        } = props;

        const defaultOptions: RCropDefaultOptions = {
            scaleY,
            scaleX,
            enable,
            zoomTo,
            rotateTo,
        };

        const innerRef = useRef<HTMLImageElement>(null);
        const combinedRef = useCombinedRefs(ref, innerRef);

        const handleZoomTo = useCallback(() => {
            if (combinedRef.current?.cropper && typeof zoomTo === 'number') {
                combinedRef.current.cropper.zoomTo(zoomTo);
            }
        }, [zoomTo]);

        const handleSrcChange = useCallback(() => {
            if (combinedRef.current?.cropper && typeof src !== 'undefined') {
                combinedRef.current.cropper.reset().clear().replace(src);
            }
        }, [src]);

        const initializeCropper = useCallback(() => {
            if (combinedRef.current !== null) {
                const cropper = new Cropper(combinedRef.current, {
                    dragMode,
                    ...rest,
                    ready: (e) => {
                        if (e.currentTarget !== null) {
                            applyDefaultOptions(
                                e.currentTarget.cropper,
                                defaultOptions,
                            );
                        }
                        ready && ready(e);
                    },
                });
                onInitialized && onInitialized(cropper);
            }
        }, [combinedRef, dragMode, rest, ready, onInitialized, defaultOptions]);

        useEffect(handleZoomTo, [handleZoomTo]);
        useEffect(handleSrcChange, [handleSrcChange]);
        useEffect(initializeCropper, [initializeCropper]);

        const imageProps = cleanImageProps({...rest, crossOrigin, src, alt});

        return (
            <div style={style} className={className}>
                <img
                    {...imageProps}
                    style={REQUIRED_IMAGE_STYLES}
                    ref={combinedRef}
                />
            </div>
        );
    },
);

export {RCrop, RCropProps, RCropElement, applyDefaultOptions};
